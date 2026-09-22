export interface ProductImage {
  url: string;
  public_id?: string;
}

export type ProductImageValue = string | ProductImage;

export interface ProductRelationRef {
  _id?: string;
  name?: string;
}

/**
 * Backwards-compatible alias for existing imports.
 */
export type ProductCategoryRef = ProductRelationRef;

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface Product {
  _id?: string;
  name: string;
  description?: string;

  price: number;
  finalPrice?: number;
  discount?: number;

  totalItems?: number;
  stock?: number;
  soldItems?: number;

  categoryId?: string | null;
  subCategoryId?: string | null;
  brandId?: string | null;

  category?: ProductRelationRef | null;
  subCategory?: ProductRelationRef | null;
  brand?: ProductRelationRef | null;

  gender?: string;
  tags?: string[];
  attributes?: ProductAttribute[];
  images?: ProductImageValue[];

  storeId?: string;
  colors?: string[];
  sizes?: string[];

  createdAt?: string;
  updatedAt?: string;
}

export interface PagedProductsResponse {
  products: Product[];
  total: number;
  page?: number;
  limit?: number;
}
