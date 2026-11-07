export interface Category {
  id: number;
  name: string;
  products_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  path: string;
  url: string;
  position: number;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  category_id: number;
  description: string | null;
  category?: Category;
  images?: ProductImage[];
  thumbnail_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatedProductsResponse {
  data: Product[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface ApiValidationErrors {
  [key: string]: string[];
}

export interface ApiError {
  message: string;
  errors?: ApiValidationErrors;
}

