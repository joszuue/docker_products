<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_can_list_categories(): void
    {
        Category::create(['name' => 'Categoría Test 1']);
        Category::create(['name' => 'Categoría Test 2']);

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['name' => 'Categoría Test 1']);
    }

    public function test_can_create_product_with_images(): void
    {
        $category = Category::create(['name' => 'Electrónica']);

        $file1 = UploadedFile::fake()->image('foto1.jpg', 600, 600);
        $file2 = UploadedFile::fake()->image('foto2.png', 600, 600);

        $payload = [
            'name' => 'Laptop Gamer',
            'category_id' => $category->id,
            'description' => 'Potente laptop con 32GB RAM y RTX 4080.',
            'images' => [$file1, $file2],
        ];

        $response = $this->postJson('/api/products', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Laptop Gamer')
            ->assertJsonPath('data.category.name', 'Electrónica')
            ->assertJsonCount(2, 'data.images');

        $this->assertDatabaseHas('products', [
            'name' => 'Laptop Gamer',
            'category_id' => $category->id,
        ]);

        $this->assertDatabaseCount('product_images', 2);
    }

    public function test_product_validation_errors(): void
    {
        $response = $this->postJson('/api/products', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'category_id']);
    }

    public function test_cannot_exceed_five_images_on_creation(): void
    {
        $category = Category::create(['name' => 'Hogar']);

        $files = [
            UploadedFile::fake()->image('1.jpg'),
            UploadedFile::fake()->image('2.jpg'),
            UploadedFile::fake()->image('3.jpg'),
            UploadedFile::fake()->image('4.jpg'),
            UploadedFile::fake()->image('5.jpg'),
            UploadedFile::fake()->image('6.jpg'),
        ];

        $response = $this->postJson('/api/products', [
            'name' => 'Mesa de centro',
            'category_id' => $category->id,
            'images' => $files,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['images']);
    }

    public function test_can_filter_and_search_products(): void
    {
        $cat1 = Category::create(['name' => 'Ropa']);
        $cat2 = Category::create(['name' => 'Calzado']);

        Product::create(['name' => 'Camisa de lino', 'category_id' => $cat1->id]);
        Product::create(['name' => 'Pantalón vaquero', 'category_id' => $cat1->id]);
        Product::create(['name' => 'Zapatos de cuero', 'category_id' => $cat2->id]);

        // Search test
        $responseSearch = $this->getJson('/api/products?search=vaquero');
        $responseSearch->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Pantalón vaquero');

        // Filter category test
        $responseCat = $this->getJson("/api/products?category_id={$cat2->id}");
        $responseCat->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Zapatos de cuero');
    }

    public function test_can_update_product_and_add_images(): void
    {
        $cat1 = Category::create(['name' => 'Deportes']);
        $cat2 = Category::create(['name' => 'Outdoor']);

        $product = Product::create([
            'name' => 'Balón de fútbol',
            'category_id' => $cat1->id,
            'description' => 'Tamaño 5 profesional',
        ]);

        $file = UploadedFile::fake()->image('balon.jpg');

        $response = $this->postJson("/api/products/{$product->id}", [
            '_method' => 'PUT',
            'name' => 'Balón de fútbol pro',
            'category_id' => $cat2->id,
            'images' => [$file],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Balón de fútbol pro')
            ->assertJsonPath('data.category_id', $cat2->id)
            ->assertJsonCount(1, 'data.images');
    }

    public function test_can_delete_individual_image(): void
    {
        $category = Category::create(['name' => 'General']);
        $product = Product::create(['name' => 'Item', 'category_id' => $category->id]);

        $fakePath = 'products/sample.jpg';
        Storage::disk('public')->put($fakePath, 'sample-content');

        $image = ProductImage::create([
            'product_id' => $product->id,
            'path' => $fakePath,
            'position' => 0,
        ]);

        $response = $this->deleteJson("/api/products/{$product->id}/images/{$image->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('product_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing($fakePath);
    }

    public function test_can_delete_product_and_clean_up_files(): void
    {
        $category = Category::create(['name' => 'General']);
        $product = Product::create(['name' => 'Item To Delete', 'category_id' => $category->id]);

        $fakePath = 'products/sample_to_delete.jpg';
        Storage::disk('public')->put($fakePath, 'sample-content');

        ProductImage::create([
            'product_id' => $product->id,
            'path' => $fakePath,
            'position' => 0,
        ]);

        $response = $this->deleteJson("/api/products/{$product->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
        $this->assertDatabaseMissing('product_images', ['path' => $fakePath]);
        Storage::disk('public')->assertMissing($fakePath);
    }
}

