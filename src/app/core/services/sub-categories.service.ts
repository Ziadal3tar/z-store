import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface SubCategoryResponse {
  allSubCategories: Array<{ _id?: string; name?: string; image?: string; categoryId?: { _id?: string; name?: string } }>;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class SubCategoriesService {
  private readonly baseUrl = `${environment.apiUrl}/subCategory`;
  private allCache$?: Observable<SubCategoryResponse>;

  constructor(private readonly http: HttpClient) {}

  allSubCategory(): Observable<SubCategoryResponse> {
    if (!this.allCache$) {
      this.allCache$ = this.http
        .get<SubCategoryResponse>(`${this.baseUrl}/allSubCategory`)
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    }
    return this.allCache$;
  }

  addSubCategory(data: unknown, categoryId: string): Observable<unknown> {
    return this.http
      .post(`${this.baseUrl}/addSubCategory/${encodeURIComponent(categoryId)}`, data)
      .pipe(tap(() => this.invalidateCache()));
  }

  removeSubCategory(id: string): Observable<unknown> {
    return this.http
      .delete(`${this.baseUrl}/removeSubCategory/${encodeURIComponent(id)}`)
      .pipe(tap(() => this.invalidateCache()));
  }

  updateSubCategory(data: unknown, id: string): Observable<unknown> {
    return this.http
      .put(`${this.baseUrl}/UpdateSubCategory/${encodeURIComponent(id)}`, data)
      .pipe(tap(() => this.invalidateCache()));
  }

  invalidateCache(): void {
    this.allCache$ = undefined;
  }
}
