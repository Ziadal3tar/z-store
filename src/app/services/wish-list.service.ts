import { getAuthToken } from 'src/app/core/auth-token.util';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class WishListService {
  private baseUrl = `${environment.apiUrl}/wishlist`;

  constructor(private http: HttpClient) {}
  addToFavorites(productId: any) {
    return this.http.put(`${this.baseUrl}/addWishList`, productId, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }
  removeToFavorites(productId: any) {
    return this.http.delete(`${this.baseUrl}/removeWishList/${productId}`, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }
}
