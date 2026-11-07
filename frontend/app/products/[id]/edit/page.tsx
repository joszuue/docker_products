'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Category, Product, ProductImage } from '@/lib/types';
import {
  getProduct,
  getCategories,
  updateProduct,
  deleteProductImage,
} from '@/lib/api';
import ImageUploader from '@/components/ImageUploader';
import ImageGallery from '@/components/ImageGallery';
import StatusMessage from '@/components/StatusMessage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  // Estados de carga de datos iniciales
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Campos del formulario
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // Estados de interacción
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>(undefined);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const [productData, categoriesData] = await Promise.all([
          getProduct(productId),
          getCategories(),
        ]);

        setProduct(productData);
        setName(productData.name);
        setCategoryId(productData.category_id.toString());
        setDescription(productData.description || '');
        setExistingImages(productData.images || []);
        setCategories(categoriesData);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Error al cargar los datos del producto.';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [productId]);

  const handleDeleteExistingImage = async (imageId: number) => {
    try {
      await deleteProductImage(productId, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      setSuccessMessage('Imagen eliminada correctamente.');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar la imagen.';
      setErrorMessage(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors(undefined);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('El nombre del producto es obligatorio.');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Por favor selecciona una categoría.');
      return;
    }

    if (existingImages.length + newFiles.length > 5) {
      setErrorMessage(
        `El límite total es de 5 imágenes. Tienes ${existingImages.length} existentes y seleccionaste ${newFiles.length} nuevas.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('name', name.trim());
      formData.append('category_id', categoryId);
      formData.append('description', description.trim());

      newFiles.forEach((file) => {
        formData.append('images[]', file);
      });

      const updated = await updateProduct(productId, formData);
      setProduct(updated);
      setExistingImages(updated.images || []);
      setNewFiles([]);
      setSuccessMessage('Producto actualizado exitosamente.');

      // Redirigir al detalle tras breve pausa
      setTimeout(() => {
        router.push(`/products/${productId}`);
      }, 1000);
    } catch (err: unknown) {
      const errorObj = err as Error & { errors?: Record<string, string[]> };
      setErrorMessage(errorObj.message || 'Error al actualizar el producto.');
      setFieldErrors(errorObj.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded-sm w-32" />
        <div className="h-8 bg-slate-200 rounded-lg w-1/2" />
        <div className="h-96 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (!product && !isLoading) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <StatusMessage
          type="error"
          message={errorMessage || 'Producto no encontrado.'}
        />
        <Link
          href="/"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Encabezado */}
      <div>
        <Link
          href={`/products/${productId}`}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 mb-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Volver al detalle</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Editar Producto
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Modifica los datos del producto, gestiona imágenes existentes o añade nuevas
        </p>
      </div>

      {/* Alertas */}
      {successMessage && (
        <StatusMessage
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

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
          <div className="relative">
            <select
              id="category"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
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
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-y"
          />
          {fieldErrors?.description && (
            <p className="text-xs text-red-600 mt-1.5">{fieldErrors.description[0]}</p>
          )}
        </div>

        {/* Gestión de imágenes existentes */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Imágenes Existentes ({existingImages.length})
          </label>
          {existingImages.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              Este producto no tiene imágenes guardadas actualmente.
            </p>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <ImageGallery
                images={existingImages}
                productName={name}
                isEditable={true}
                onDeleteImage={handleDeleteExistingImage}
              />
            </div>
          )}
        </div>

        {/* Carga de Nuevas Imágenes */}
        <div className="pt-4 border-t border-slate-100">
          <ImageUploader
            files={newFiles}
            onFilesChange={setNewFiles}
            maxFiles={5}
            existingImagesCount={existingImages.length}
          />
          {fieldErrors?.images && (
            <p className="text-xs text-red-600 mt-1.5">{fieldErrors.images[0]}</p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
          <Link
            href={`/products/${productId}`}
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
                Guardando cambios...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
