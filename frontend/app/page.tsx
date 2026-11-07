'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Category, Product, PaginationMeta } from '@/lib/types';
import { getCategories, getProducts, deleteProduct, resolveImageUrl } from '@/lib/api';
import DeleteModal from '@/components/DeleteModal';
import StatusMessage from '@/components/StatusMessage';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState(1);

  // Estados de carga y error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estado para modal de eliminación
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carga inicial de categorías
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err: unknown) {
        console.error('Error al cargar categorías:', err);
      }
    }
    loadCategories();
  }, []);

  // Carga de productos
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getProducts({
        page,
        search: search.trim() || undefined,
        category_id: selectedCategory || undefined,
        per_page: 8,
      });
      setProducts(res.data);
      setMeta(res.meta);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error al comunicarse con el servidor.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, selectedCategory]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      setSuccessMessage(`El producto "${productToDelete.name}" fue eliminado.`);
      setProductToDelete(null);
      // Recargar listado
      loadProducts();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar el producto.';
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Listado de Productos
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Consulta, filtra y administra los artículos del catálogo
          </p>
        </div>
        <Link
          href="/products/create"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors self-start sm:self-auto"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Producto
        </Link>
      </div>

      {/* Alertas */}
      {successMessage && (
        <StatusMessage
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {error && (
        <StatusMessage
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre de producto..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </form>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px]">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {(search || selectedCategory) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium whitespace-nowrap"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-3">
              <div className="bg-slate-200 rounded-xl aspect-4/3 w-full" />
              <div className="h-4 bg-slate-200 rounded-sm w-3/4" />
              <div className="h-3 bg-slate-200 rounded-sm w-1/2" />
              <div className="h-8 bg-slate-100 rounded-lg w-full mt-2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            No se encontraron productos
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {search || selectedCategory
              ? 'Intenta ajustar tus términos de búsqueda o selecciona otra categoría.'
              : 'Empieza agregando tu primer producto al catálogo.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {search || selectedCategory ? (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Limpiar filtros
              </button>
            ) : null}
            <Link
              href="/products/create"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Crear Producto
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Grilla de Productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product) => {
              const thumbnail = resolveImageUrl(
                product.thumbnail_url || product.images?.[0]?.url || product.images?.[0]?.path
              );
              const imageCount = product.images?.length || 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
                >
                  {/* Miniatura */}
                  <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnail}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-slate-900/60 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{imageCount}</span>
                    </div>

                    {product.category && (
                      <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-slate-800 text-[11px] font-medium px-2 py-0.5 rounded-md shadow-2xs">
                        {product.category.name}
                      </div>
                    )}
                  </div>

                  {/* Datos del producto */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={product.name}>
                        {product.name}
                      </h2>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {product.description || 'Sin descripción detallada.'}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/products/${product.id}`}
                        className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center space-x-1 transition-colors"
                        title="Ver detalle"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Detalle</span>
                      </Link>

                      <div className="flex items-center space-x-1">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                          title="Editar producto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(product)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar producto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controles de Paginación */}
          {meta && meta.last_page > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Mostrando <span className="font-semibold">{meta.from || 0}</span> a{' '}
                <span className="font-semibold">{meta.to || 0}</span> de{' '}
                <span className="font-semibold">{meta.total}</span> productos
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>

                <div className="flex items-center space-x-1">
                  {[...Array(meta.last_page)].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(meta.last_page, prev + 1))}
                  disabled={page >= meta.last_page}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación de eliminación */}
      <DeleteModal
        isOpen={!!productToDelete}
        title="¿Eliminar producto?"
        description={`¿Estás seguro de que deseas eliminar permanentemente el producto "${productToDelete?.name}"? Esta acción borrará el registro y todas sus imágenes asociadas.`}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}
