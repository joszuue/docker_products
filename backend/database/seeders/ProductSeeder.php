<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $electronica = Category::firstOrCreate(['name' => 'Electrónica y Tecnología']);
        $ropa = Category::firstOrCreate(['name' => 'Ropa y Moda']);
        $hogar = Category::firstOrCreate(['name' => 'Hogar y Decoración']);
        $deportes = Category::firstOrCreate(['name' => 'Deportes y Fitness']);

        $products = [
            [
                'name' => 'Laptop Ultra Slim 15"',
                'category_id' => $electronica->id,
                'description' => 'Laptop de alto rendimiento equipada con procesador de última generación, 16 GB de RAM y pantalla OLED de 120Hz.',
            ],
            [
                'name' => 'Auriculares Inalámbricos Noise Cancelling',
                'category_id' => $electronica->id,
                'description' => 'Auriculares circumaurales con cancelación activa de ruido adaptativa y hasta 35 horas de autonomía.',
            ],
            [
                'name' => 'Chaqueta Impermeable Cortavientos',
                'category_id' => $ropa->id,
                'description' => 'Chaqueta técnica ligera, resistente al agua y con costuras termoselladas ideal para actividades al aire libre.',
            ],
            [
                'name' => 'Lámpara de Escritorio LED Inteligente',
                'category_id' => $hogar->id,
                'description' => 'Lámpara minimalista con control de temperatura de color, ajuste de brillo continuo y puerto de carga USB-C integrado.',
            ],
            [
                'name' => 'Set de Mancuernas Ajustables 20kg',
                'category_id' => $deportes->id,
                'description' => 'Par de mancuernas modulares con selector rápido de peso y recubrimiento ergonómico antideslizante.',
            ],
        ];

        foreach ($products as $p) {
            Product::firstOrCreate(
                ['name' => $p['name']],
                [
                    'category_id' => $p['category_id'],
                    'description' => $p['description'],
                ]
            );
        }
    }
}

