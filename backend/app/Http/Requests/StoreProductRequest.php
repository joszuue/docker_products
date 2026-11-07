<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'description' => ['nullable', 'string', 'max:5000'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['file', 'mimes:jpeg,png,webp,jpg', 'max:5120'],
        ];
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

