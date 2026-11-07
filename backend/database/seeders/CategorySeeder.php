<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Electrónica y Tecnología',
            'Ropa y Moda',
            'Hogar y Decoración',
            'Deportes y Fitness',
            'Alimentos y Bebidas',
            'Belleza y Cuidado Personal',
            'Libros y Papelería',
            'Juguetes y Juegos',
        ];

        foreach ($categories as $categoryName) {
            Category::firstOrCreate(['name' => $categoryName]);
        }
    }
}

