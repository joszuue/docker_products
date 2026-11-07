<?php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'description' => ['nullable', 'string', 'max:5000'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['file', 'mimes:jpeg,png,webp,jpg', 'max:5120'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $product = $this->route('product');

            if ($product && $this->hasFile('images')) {
                $productModel = is_numeric($product) ? Product::find($product) : $product;
                if ($productModel) {
                    $existingCount = $productModel->images()->count();
                    $newCount = count($this->file('images'));
                    if (($existingCount + $newCount) > 5) {
                        $validator->errors()->add(
                            'images',
                            "El producto ya cuenta con {$existingCount} imágenes. No puedes superar un total de 5 imágenes (intentaste añadir {$newCount})."
                        );
                    }
                }
            }
        });
    }

    /**
     * Custom messages for validation errors in Spanish.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del producto es obligatorio.',
            'name.string' => 'El nombre debe ser una cadena de texto.',
            'name.max' => 'El nombre no puede exceder los 255 caracteres.',
            'category_id.required' => 'La categoría es obligatoria.',
            'category_id.integer' => 'El identificador de categoría no es válido.',
            'category_id.exists' => 'La categoría seleccionada no existe.',
            'description.string' => 'La descripción debe ser un texto.',
            'description.max' => 'La descripción no puede exceder los 5000 caracteres.',
            'images.array' => 'El campo de imágenes debe ser una lista de archivos.',
            'images.max' => 'No puedes subir más de 5 imágenes.',
            'images.*.file' => 'Cada elemento debe ser un archivo válido.',
            'images.*.mimes' => 'Las imágenes deben estar en formato JPEG, PNG o WebP.',
            'images.*.max' => 'Cada imagen no debe superar los 5 MB de tamaño.',
        ];
    }
}
