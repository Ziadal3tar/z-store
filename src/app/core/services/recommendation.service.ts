import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly baseUrl = `${environment.apiUrl}/product/recommendations`;
  private readonly cache = new Map<string, Observable<{ products: Product[] }>>();
  constructor(private readonly http: HttpClient) {}

  getForProduct(productId: string): Observable<{ products: Product[] }> {
    const cached = this.cache.get(productId);
    if (cached) return cached;
    const request$ = this.http.get<{ products: Product[] }>(`${this.baseUrl}/${encodeURIComponent(productId)}`).pipe(
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.cache.set(productId, request$);
    return request$;
  }
}
