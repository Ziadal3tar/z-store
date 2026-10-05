import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedProductsResponse, Product } from '../../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class StoreProductsService {
  private readonly base = `${environment.apiUrl}/product`;
  private readonly storeListCache = new Map<string, Observable<PagedProductsResponse>>();
  private readonly maxCacheEntries = 20;

  constructor(private readonly http: HttpClient) {}

  addProduct(formData: FormData, categoryId: string): Observable<{ product: Product }> {
    return this.http
      .post<{ product: Product }>(
        `${this.base}/addProduct/${encodeURIComponent(categoryId)}`,
        formData,
      )
      .pipe(tap(() => this.invalidateStoreCache()));
  }

  editProduct(productId: string, formData: FormData): Observable<{ product: Product }> {
    return this.http
      .put<{ product: Product }>(
        `${this.base}/updateProduct/${encodeURIComponent(productId)}`,
        formData,
      )
      .pipe(tap(() => this.invalidateStoreCache()));
  }

  getProduct(productId: string): Observable<{ product: Product }> {
    return this.http.get<{ product: Product }>(
      `${this.base}/getProduct/${encodeURIComponent(productId)}`,
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
    } = {},
  ): Observable<PagedProductsResponse> {
    let params = new HttpParams();
    if (opts.page != null) params = params.set('page', String(opts.page));
    if (opts.limit != null) params = params.set('limit', String(opts.limit));
    if (opts.q) params = params.set('q', opts.q.trim());
    if (opts.category) params = params.set('category', opts.category);
    if (opts.minPrice != null) params = params.set('minPrice', String(opts.minPrice));
    if (opts.maxPrice != null) params = params.set('maxPrice', String(opts.maxPrice));

    const cacheKey = `${storeId}?${params.toString()}`;
    const cached = this.storeListCache.get(cacheKey);
    if (cached) return cached;

    const request$ = this.http
      .get<PagedProductsResponse>(
        `${this.base}/getStoresProducts/${encodeURIComponent(storeId)}`,
        { params },
      )
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));

    if (this.storeListCache.size >= this.maxCacheEntries) {
      const oldestKey = this.storeListCache.keys().next().value;
      if (oldestKey) this.storeListCache.delete(oldestKey);
    }
    this.storeListCache.set(cacheKey, request$);

    return request$;
  }

  deleteProduct(productId: string): Observable<{ message?: string }> {
    return this.http
      .delete<{ message?: string }>(
        `${this.base}/removeProduct/${encodeURIComponent(productId)}`,
      )
      .pipe(tap(() => this.invalidateStoreCache()));
  }

  invalidateStoreCache(): void {
    this.storeListCache.clear();
  }
}
