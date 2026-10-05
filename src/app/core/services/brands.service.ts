import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface BrandsResponse {
  brands: Array<{ _id?: string; name?: string; image?: string }>;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class BrandsService {
  private readonly baseUrl = `${environment.apiUrl}/brand`;
  private allCache$?: Observable<BrandsResponse>;

  constructor(private readonly http: HttpClient) {}

  allBrands(): Observable<BrandsResponse> {
    if (!this.allCache$) {
      this.allCache$ = this.http
        .get<BrandsResponse>(`${this.baseUrl}/allBrands`)
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    }
    return this.allCache$;
  }

  addBrand(data: unknown): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/addBrand`, data).pipe(tap(() => this.invalidateCache()));
  }

  removeBrand(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/removeBrand/${encodeURIComponent(id)}`).pipe(tap(() => this.invalidateCache()));
  }

  updateBrand(data: unknown, id: string): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/updateBrand/${encodeURIComponent(id)}`, data).pipe(tap(() => this.invalidateCache()));
  }

  invalidateCache(): void {
    this.allCache$ = undefined;
  }
}
