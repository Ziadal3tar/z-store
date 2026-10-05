import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class WishListService {
  private readonly baseUrl = `${environment.apiUrl}/wishlist`;

  constructor(private readonly http: HttpClient) {}

  addToFavorites(payload: { productId: string }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/addWishList`, payload);
  }

  removeToFavorites(productId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/removeWishList/${encodeURIComponent(productId)}`);
  }
}
