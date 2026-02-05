import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  totalItems?: number;
  soldItems?: number;
  categoryId?: string | null;
  subCategoryId?: string | null;
  brandId?: string | null;
  tags?: string[];
  attributes?: Array<{ key: string; value: string }>;
  images?: Array<{ url: string; public_id?: string }>;
  storeId?: string;
  colors?: string[];
  sizes?: string[];
  createdAt?: string;
}

export interface PagedProductsResponse {
  products: Product[];
  total: number;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private base = 'https://z-store-apis-b6lh.vercel.app/Product';

  constructor(private http: HttpClient) {}

  // add product: POST /Product (FormData)
  addProduct(formData: FormData): Observable<{ product: Product }> {
    return this.http.post<{ product: Product }>(`${this.base}`, formData);
  }

  // edit product: PUT /Product/:productId
  editProduct(productId: string, formData: FormData): Observable<{ product: Product }> {
    return this.http.put<{ product: Product }>(`${this.base}/${encodeURIComponent(productId)}`, formData);
  }

  getProduct(productId: string): Observable<{ product: Product }> {
    return this.http.get<{ product: Product }>(`${this.base}/${encodeURIComponent(productId)}`);
  }

  getStoreProducts(storeId: string, opts: { page?: number; limit?: number; q?: string; category?: string; minPrice?: number; maxPrice?: number } = {}): Observable<PagedProductsResponse> {
    let params = new HttpParams();
    if (opts.page != null) params = params.set('page', String(opts.page));
    if (opts.limit != null) params = params.set('size', String(opts.limit));
    if (opts.q) params = params.set('q', opts.q);
    if (opts.category) params = params.set('category', opts.category);
    if (opts.minPrice != null) params = params.set('minPrice', String(opts.minPrice));
    if (opts.maxPrice != null) params = params.set('maxPrice', String(opts.maxPrice));
    return this.http.get<PagedProductsResponse>(`${this.base}/store/${encodeURIComponent(storeId)}`, { params });
  }

  deleteProduct(productId: string): Observable<{ message?: string }> {
    return this.http.delete<{ message?: string }>(`${this.base}/${encodeURIComponent(productId)}`);
  }

  uploadProductImage(productId: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.base}/${encodeURIComponent(productId)}/upload-image`, formData);
  }
}
