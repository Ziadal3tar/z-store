import { Product, PagedProductsResponse } from './product.model';

export interface ProductResponse {
  product: Product;
  message?: string;
}

export interface ProductActionResponse {
  message?: string;
  product?: Product;
}

export interface ProductListResponse extends PagedProductsResponse {
  message?: string;
}

export interface StoreProductsQuery {
  page?: number;
  limit?: number;
  q?: string;
}

export interface ProductDeletePayload {
  productId?: string;
  _id?: string;
  [key: string]: unknown;
}
