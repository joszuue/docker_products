<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    /**
     * Remove the specified product image from storage and database.
     */
    public function destroy(ProductImage $image): JsonResponse
    {
        return $this->deleteImage($image);
    }

    /**
     * Remove the specified image belonging to a specific product.
     */
    public function destroyForProduct(Product $product, ProductImage $image): JsonResponse
    {
        if ($image->product_id !== $product->id) {
            return response()->json([
                'message' => 'La imagen no pertenece al producto especificado.',
            ], 404);
        }

        return $this->deleteImage($image);
    }

    /**
     * Execute safe deletion of image record and underlying file.
     */
    protected function deleteImage(ProductImage $image): JsonResponse
    {
        $filePath = $image->path;

        try {
            DB::transaction(function () use ($image) {
                $image->delete();
            });

            // Delete file after database commit to ensure no data loss if DB fails
            if (!empty($filePath) && Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            return response()->json([
                'message' => 'Imagen eliminada correctamente.',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Error al eliminar imagen de producto: ' . $e->getMessage(), [
                'image_id' => $image->id,
                'path' => $filePath,
            ]);

            return response()->json([
                'message' => 'Error al eliminar la imagen.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
