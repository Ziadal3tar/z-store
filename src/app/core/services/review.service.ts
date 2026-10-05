import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProductReview } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly baseUrl = `${environment.apiUrl}/review`;
  constructor(private readonly http: HttpClient) {}

  getProductReviews(productId: string, page = 1, limit = 8): Observable<{ reviews: ProductReview[]; average: number; total: number; totalPages: number }> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<{ reviews: ProductReview[]; average: number; total: number; totalPages: number }>(`${this.baseUrl}/product/${encodeURIComponent(productId)}`, { params });
  }

  createReview(payload: { productId: string; orderId: string; rating: number; comment: string }): Observable<{ review: ProductReview }> {
    return this.http.post<{ review: ProductReview }>(this.baseUrl, payload);
  }

  markHelpful(reviewId: string): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/${encodeURIComponent(reviewId)}/helpful`, {});
  }
}
