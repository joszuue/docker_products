'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { getProduct, deleteProduct } from '@/lib/api';
import ImageGallery from '@/components/ImageGallery';
import DeleteModal from '@/components/DeleteModal';
import StatusMessage from '@/components/StatusMessage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getProduct(productId);
        setProduct(data);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'No se pudo cargar la información del producto.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [productId]);

  const handleDelete = async () => {
    if (!product) return;
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      router.push('/');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar el producto.';
      setError(message);
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded-sm w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-4/3 bg-slate-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded-lg w-3/4" />
            <div className="h-5 bg-slate-200 rounded-md w-1/4" />
            <div className="h-24 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <StatusMessage
          type="error"
          message={error || 'Producto no encontrado.'}
        />
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const formattedCreatedDate = product.created_at
    ? new Date(product.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navegación superior */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Volver al listado</span>
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            href={`/products/${product.id}/edit`}
            className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <svg className="w-3.5 h-3.5 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </Link>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Galería de Imágenes (7 columnas en desktop) */}
          <div className="lg:col-span-7">
            <ImageGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Información del Producto (5 columnas en desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {product.category && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 tracking-wide uppercase">
                  {product.category.name}
                </span>
              )}

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {product.name}
              </h1>

              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Descripción
                </h3>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description || 'Este producto no cuenta con una descripción detallada.'}
                </div>
              </div>
            </div>

            {/* Metadatos */}
            <div className="pt-6 border-t border-slate-100 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Identificador:</span>
                <span className="font-mono text-slate-600">#{product.id}</span>
              </div>
              {formattedCreatedDate && (
                <div className="flex justify-between">
                  <span>Fecha de alta:</span>
                  <span className="text-slate-600">{formattedCreatedDate}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Total de imágenes:</span>
                <span className="text-slate-600 font-medium">
                  {product.images?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        title="¿Eliminar producto?"
        description={`¿Estás seguro de que deseas eliminar permanentemente "${product.name}"? Se borrarán sus datos y sus imágenes asociadas.`}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}

