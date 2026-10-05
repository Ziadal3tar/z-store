import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product, PagedProductsResponse } from '../models/product.model';

export interface HomeFeedResponse {
  special: Product[];
  bestSelling: Product[];
  newArrivals: Product[];
  categories: Array<{ _id: string; name: string; image?: string }>;
  brands: Array<{ _id: string; name: string; image?: string }>;
}

export interface ProductListResponse extends PagedProductsResponse {
  message?: string;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly baseUrl = `${environment.apiUrl}/product`;
  private readonly listCache = new Map<string, Observable<ProductListResponse>>();
  private readonly detailCache = new Map<string, Observable<{ product: Product }>>();
  private readonly storeCache = new Map<string, Observable<{ products: Product[] }>>();
  private homeFeed$?: Observable<HomeFeedResponse>;
  private readonly maxListCacheEntries = 40;
  private readonly maxDetailCacheEntries = 30;
  private readonly maxStoreCacheEntries = 20;

  constructor(private readonly http: HttpClient) {}

  addProduct(formData: FormData, categoryId: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/addProduct/${encodeURIComponent(categoryId)}`, formData).pipe(tap(() => this.invalidateCache()));
  }

  removeProduct(productId: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/removeProduct/${encodeURIComponent(productId)}`).pipe(tap(() => this.invalidateCache()));
  }

  getProducts(query: { page?: number; limit?: number; search?: string; category?: string; brand?: string; minPrice?: number; maxPrice?: number; sort?: string; color?: string; inStockOnly?: boolean; minimumRating?: number } = {}): Observable<ProductListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('q', query.search?.trim() ?? '')
      .set('category', query.category ?? '')
      .set('brand', query.brand ?? '')
      .set('color', query.color ?? '')
      .set('minPrice', query.minPrice == null ? '' : query.minPrice)
      .set('maxPrice', query.maxPrice == null ? '' : query.maxPrice)
      .set('sort', query.sort ?? 'featured')
      .set('inStock', query.inStockOnly ? 'true' : '')
      .set('minRating', query.minimumRating ? String(query.minimumRating) : '');

    const key = params.toString();
    const cached = this.listCache.get(key);
    if (cached) return cached;

    const request$ = this.http.get<ProductListResponse>(`${this.baseUrl}/allProducts`, { params }).pipe(shareReplay({ bufferSize: 1, refCount: false }));
    this.remember(this.listCache, key, request$, this.maxListCacheEntries);
    return request$;
  }

  searchProducts(search: string, limit = 6): Observable<ProductListResponse> {
    return this.getProducts({ page: 1, limit, search });
  }

  getProductById(id: string): Observable<{ product: Product }> {
    const cached = this.detailCache.get(id);
    if (cached) return cached;
    const request$ = this.http.get<{ product: Product }>(`${this.baseUrl}/getProduct/${encodeURIComponent(id)}`).pipe(shareReplay({ bufferSize: 1, refCount: false }));
    this.remember(this.detailCache, id, request$, this.maxDetailCacheEntries);
    return request$;
  }

  getHomeFeed(): Observable<HomeFeedResponse> {
    if (this.homeFeed$) return this.homeFeed$;
    this.homeFeed$ = this.http.get<HomeFeedResponse>(`${this.baseUrl}/homeFeed`).pipe(shareReplay({ bufferSize: 1, refCount: false }));
    return this.homeFeed$;
  }

  getStoresProducts(storeId: string): Observable<{ products: Product[] }> {
    const cached = this.storeCache.get(storeId);
    if (cached) return cached;
    const request$ = this.http
      .get<{ products: Product[] }>(`${this.baseUrl}/getStoresProducts/${encodeURIComponent(storeId)}`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    this.remember(this.storeCache, storeId, request$, this.maxStoreCacheEntries);
    return request$;
  }

  updateProduct(productId: string, formData: FormData): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/updateProduct/${encodeURIComponent(productId)}`, formData).pipe(tap(() => this.invalidateCache()));
  }

  deleteProduct(productId: string): Observable<unknown> {
    return this.removeProduct(productId);
  }

  addproduct(formData: FormData, categoryId: string): Observable<unknown> {
    return this.addProduct(formData, categoryId);
  }

  removeproduct(productId: string): Observable<unknown> {
    return this.removeProduct(productId);
  }

  getProduct(page = 1, limit = 12, search = ''): Observable<ProductListResponse> {
    return this.getProducts({ page, limit, search });
  }

  getSpecialOffers(): Observable<ProductListResponse> {
    return this.http.get<ProductListResponse>(`${this.baseUrl}/getSpecialProduct`).pipe(
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  invalidateCache(): void {
    this.listCache.clear();
    this.detailCache.clear();
    this.storeCache.clear();
    this.homeFeed$ = undefined;
  }

  private remember<T>(
    cache: Map<string, Observable<T>>,
    key: string,
    value: Observable<T>,
    maxEntries: number,
  ): void {
    if (cache.size >= maxEntries) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }
    cache.set(key, value);
  }

}
