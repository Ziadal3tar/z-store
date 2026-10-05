import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CategoryResponse {
  categories: Array<{ _id?: string; name?: string; image?: string }>;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly baseUrl = `${environment.apiUrl}/category`;
  private allCache$?: Observable<CategoryResponse>;

  constructor(private readonly http: HttpClient) {}

  allCategory(): Observable<CategoryResponse> {
    if (!this.allCache$) {
      this.allCache$ = this.http
        .get<CategoryResponse>(`${this.baseUrl}/allCategories`)
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    }
    return this.allCache$;
  }

  addCategory(data: unknown): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/addCategory`, data).pipe(tap(() => this.invalidateCache()));
  }

  removeCategory(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/removeCategory/${encodeURIComponent(id)}`).pipe(tap(() => this.invalidateCache()));
  }

  updateCategory(data: unknown, id: string): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/updateCategory/${encodeURIComponent(id)}`, data).pipe(tap(() => this.invalidateCache()));
  }

  invalidateCache(): void {
    this.allCache$ = undefined;
  }
}
