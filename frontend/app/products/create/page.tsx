'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Category } from '@/lib/types';
import { getCategories, createProduct } from '@/lib/api';
import ImageUploader from '@/components/ImageUploader';
import StatusMessage from '@/components/StatusMessage';

export default function CreateProductPage() {
  const router = useRouter();

  // Datos del formulario
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  // Categorías
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Estados de envío y respuesta
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>(undefined);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(data[0].id.toString());
        }
      } catch (err: unknown) {
        console.error('Error al cargar categorías:', err);
        setErrorMessage('No se pudieron cargar las categorías del servidor.');
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors(undefined);

    // Validación básica en cliente
    if (!name.trim()) {
      setErrorMessage('Por favor ingresa el nombre del producto.');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Por favor selecciona una categoría.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('category_id', categoryId);
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      files.forEach((file) => {
        formData.append('images[]', file);
      });

      const newProduct = await createProduct(formData);
      router.push(`/products/${newProduct.id}`);
    } catch (err: unknown) {
      const errorObj = err as Error & { errors?: Record<string, string[]> };
      setErrorMessage(errorObj.message || 'Error al guardar el producto.');
      setFieldErrors(errorObj.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Encabezado */}
      <div>
        <Link
          href="/"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 mb-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Volver al listado</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Crear Nuevo Producto
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Completa los datos del producto y añade hasta cinco imágenes
        </p>
      </div>

      {/* Alerta de Error */}
      {errorMessage && (
        <StatusMessage
          type="error"
          message={errorMessage}
          errors={fieldErrors}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Nombre del Producto <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Teclado Mecánico RGB"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          {fieldErrors?.name && (
            <p className="text-xs text-red-600 mt-1.5">{fieldErrors.name[0]}</p>
          )}
        </div>

        {/* Categoría */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Categoría <span className="text-red-500">*</span>
          </label>
          {isLoadingCategories ? (
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <div className="relative">
              <select
                id="category"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Selecciona una categoría...
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
          {fieldErrors?.category_id && (
            <p className="text-xs text-red-600 mt-1.5">{fieldErrors.category_id[0]}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Descripción
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Escribe los detalles, especificaciones o características del producto..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-y"
          />
          {fieldErrors?.description && (
            <p className="text-xs text-red-600 mt-1.5">{fieldErrors.description[0]}</p>
          )}
        </div>

        {/* Carga de Imágenes */}
        <div className="pt-2 border-t border-slate-100">
          <ImageUploader
            files={files}
            onFilesChange={setFiles}
            maxFiles={5}
            existingImagesCount={0}
          />
          {fieldErrors?.images && (
            <p className="text-xs text-red-600 mt-1.5">{fieldErrors.images[0]}</p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Guardando producto...
              </>
            ) : (
              'Guardar Producto'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

