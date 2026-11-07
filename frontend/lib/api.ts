import {
  Category,
  PaginatedProductsResponse,
  Product,
  ApiError,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const STORAGE_BASE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';

/**
 * Resuelve una URL de imagen para garantizar que sea accesible desde el navegador.
 */
export function resolveImageUrl(urlOrPath: string | null | undefined): string {
  if (!urlOrPath) {
    return '/placeholder-image.svg';
  }

  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }

  if (urlOrPath.startsWith('/storage/')) {
    const origin = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${origin}${urlOrPath}`;
  }

  const cleanPath = urlOrPath.startsWith('/') ? urlOrPath.substring(1) : urlOrPath;
  return `${STORAGE_BASE_URL}/${cleanPath}`;
}

/**
 * Helper para procesar respuestas de la API y capturar errores detallados de Laravel.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    // Si la respuesta es 204 No Content
    if (response.status === 204) {
      return {} as T;
    }
    return response.json();
  }

  let errorData: ApiError = {
    message: `Error HTTP ${response.status}: ${response.statusText}`,
  };

  try {
    const json = await response.json();
    errorData = {
      message: json.message || errorData.message,
      errors: json.errors,
    };
  } catch {
    // La respuesta no era JSON
  }

  const error = new Error(errorData.message) as Error & {
    status?: number;
    errors?: Record<string, string[]>;
  };
  error.status = response.status;
  error.errors = errorData.errors;

  throw error;
}

export interface GetProductsParams {
  page?: number;
  search?: string;
  category_id?: number | string;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Obtener listado de categorías.
 */
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });

  const json = await handleResponse<{ data: Category[] }>(res);
  return json.data;
}

/**
 * Obtener listado paginado de productos con filtros y búsqueda.
 */
export async function getProducts(
  params: GetProductsParams = {}
): Promise<PaginatedProductsResponse> {
  const query = new URLSearchParams();

  if (params.page) query.set('page', params.page.toString());
  if (params.search) query.set('search', params.search);
  if (params.category_id) query.set('category_id', params.category_id.toString());
  if (params.per_page) query.set('per_page', params.per_page.toString());
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.sort_order) query.set('sort_order', params.sort_order);

  const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });

  return handleResponse<PaginatedProductsResponse>(res);
}

/**
 * Obtener detalle de un producto específico.
 */
export async function getProduct(id: number | string): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });

  const json = await handleResponse<{ data: Product }>(res);
  return json.data;
}

/**
 * Crear un nuevo producto con imágenes (multipart/form-data).
 */
export async function createProduct(formData: FormData): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
      // No configurar 'Content-Type', el navegador incluye multipart/form-data y boundary automáticamente
    },
  });

  const json = await handleResponse<{ data: Product }>(res);
  return json.data;
}

/**
 * Actualizar un producto existente con soporte de multipart/form-data.
 * Para compatibilidad óptima con Laravel y PHP, utiliza POST con _method=PUT.
 */
export async function updateProduct(
  id: number | string,
  formData: FormData
): Promise<Product> {
  if (!formData.has('_method')) {
    formData.append('_method', 'PUT');
  }

  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  const json = await handleResponse<{ data: Product }>(res);
  return json.data;
}

/**
 * Eliminar un producto.
 */
export async function deleteProduct(id: number | string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  });

  return handleResponse<{ message: string }>(res);
}

/**
 * Eliminar una imagen individual de un producto.
 */
export async function deleteProductImage(
  productId: number | string,
  imageId: number | string
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/images/${imageId}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  });

  return handleResponse<{ message: string }>(res);
}

