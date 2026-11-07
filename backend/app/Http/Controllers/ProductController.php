<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a paginated listing of the products with search and category filtering.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::with(['category', 'images']);

        // Search by name
        if ($request->filled('search')) {
            $searchTerm = trim($request->input('search'));
            $query->where('name', 'like', "%{$searchTerm}%");
        }

        // Filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        // Ordering
        $sortBy = in_array($request->input('sort_by'), ['name', 'created_at', 'id'])
            ? $request->input('sort_by')
            : 'created_at';
        $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = max(1, min((int) $request->input('per_page', 10), 50));
        $products = $query->paginate($perPage);

        return ProductResource::collection($products);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $savedFilePaths = [];

        try {
            $product = DB::transaction(function () use ($validated, $request, &$savedFilePaths) {
                // Create product record
                $product = Product::create([
                    'category_id' => $validated['category_id'],
                    'name' => $validated['name'],
                    'description' => $validated['description'] ?? null,
                ]);

                // Process uploaded images
                if ($request->hasFile('images')) {
                    $position = 0;
                    foreach ($request->file('images') as $file) {
                        // Store image with securely generated hash name in public disk
                        $path = $file->store('products', 'public');
                        $savedFilePaths[] = $path;

                        $product->images()->create([
                            'path' => $path,
                            'position' => $position++,
                        ]);
                    }
                }

                return $product;
            });

            $product->load(['category', 'images']);

            return (new ProductResource($product))
                ->response()
                ->setStatusCode(201);
        } catch (\Throwable $e) {
            // Rollback uploaded files to prevent orphaned files on disk
            foreach ($savedFilePaths as $filePath) {
                if (Storage::disk('public')->exists($filePath)) {
                    Storage::disk('public')->delete($filePath);
                }
            }

            Log::error('Error al crear producto: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Ocurrió un error al guardar el producto.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): ProductResource
    {
        $product->load(['category', 'images']);

        return new ProductResource($product);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $validated = $request->validated();
        $savedFilePaths = [];

        try {
            DB::transaction(function () use ($validated, $request, $product, &$savedFilePaths) {
                // Update basic fields
                $updateData = [];
                if (isset($validated['name'])) {
                    $updateData['name'] = $validated['name'];
                }
                if (isset($validated['category_id'])) {
                    $updateData['category_id'] = $validated['category_id'];
                }
                if (array_key_exists('description', $validated)) {
                    $updateData['description'] = $validated['description'];
                }

                if (!empty($updateData)) {
                    $product->update($updateData);
                }

                // Process newly uploaded images
                if ($request->hasFile('images')) {
                    $currentMaxPosition = (int) ($product->images()->max('position') ?? -1);
                    $nextPosition = $currentMaxPosition + 1;

                    foreach ($request->file('images') as $file) {
                        $path = $file->store('products', 'public');
                        $savedFilePaths[] = $path;

                        $product->images()->create([
                            'path' => $path,
                            'position' => $nextPosition++,
                        ]);
                    }
                }
            });

            $product->load(['category', 'images']);

            return (new ProductResource($product))
                ->response()
                ->setStatusCode(200);
        } catch (\Throwable $e) {
            // Clean up newly uploaded files on error
            foreach ($savedFilePaths as $filePath) {
                if (Storage::disk('public')->exists($filePath)) {
                    Storage::disk('public')->delete($filePath);
                }
            }

            Log::error('Error al actualizar producto: ' . $e->getMessage(), [
                'product_id' => $product->id,
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Ocurrió un error al actualizar el producto.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified product and all its images from storage and database.
     */
    public function destroy(Product $product): JsonResponse
    {
        $imagePaths = $product->images()->pluck('path')->filter()->all();

        try {
            DB::transaction(function () use ($product) {
                // Delete product record (cascade deletes product_images in DB)
                $product->delete();
            });

            // Delete physical image files from disk after DB transaction succeeds
            foreach ($imagePaths as $path) {
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }

            return response()->json([
                'message' => 'Producto eliminado correctamente.',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Error al eliminar producto: ' . $e->getMessage(), [
                'product_id' => $product->id,
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Error al eliminar el producto.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
