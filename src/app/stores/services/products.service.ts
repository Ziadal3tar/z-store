import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedProductsResponse, Product } from '../../core/models/product.model';

export { PagedProductsResponse, Product } from '../../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly base = `${environment.apiUrl}/Product`;

  constructor(private readonly http: HttpClient) {}

  addProduct(formData: FormData): Observable<{ product: Product }> {
    return this.http.post<{ product: Product }>(this.base, formData);
  }

  editProduct(productId: string, formData: FormData): Observable<{ product: Product }> {
    return this.http.put<{ product: Product }>(
      `${this.base}/${encodeURIComponent(productId)}`,
      formData
    );
  }

  getProduct(productId: string): Observable<{ product: Product }> {
    return this.http.get<{ product: Product }>(
      `${this.base}/${encodeURIComponent(productId)}`
    );
  }

  getStoreProducts(
    storeId: string,
    opts: {
      page?: number;
      limit?: number;
      q?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
    } = {}
  ): Observable<PagedProductsResponse> {
    let params = new HttpParams();
    if (opts.page != null) params = params.set('page', String(opts.page));
    if (opts.limit != null) params = params.set('size', String(opts.limit));
    if (opts.q) params = params.set('q', opts.q);
    if (opts.category) params = params.set('category', opts.category);
    if (opts.minPrice != null) params = params.set('minPrice', String(opts.minPrice));
    if (opts.maxPrice != null) params = params.set('maxPrice', String(opts.maxPrice));

    return this.http.get<PagedProductsResponse>(
      `${this.base}/store/${encodeURIComponent(storeId)}`,
      { params }
    );
  }

  deleteProduct(productId: string): Observable<{ message?: string }> {
    return this.http.delete<{ message?: string }>(
      `${this.base}/${encodeURIComponent(productId)}`
    );
  }

  uploadProductImage(productId: string, formData: FormData): Observable<unknown> {
    return this.http.post(
      `${this.base}/${encodeURIComponent(productId)}/upload-image`,
      formData
    );
  }
}
