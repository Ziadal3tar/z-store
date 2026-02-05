import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // private baseUrl = 'https://z-store-apis-b6lh.vercel.app/cart';
  private baseUrl = 'https://z-store-apis-b6lh.vercel.app/cart';

  constructor(private http: HttpClient) {}
  addToCart(product: any) {
    return this.http.post(
      `${this.baseUrl}/createCart`,
      product,

      {
        headers: {
          authorization: `Bearer__${localStorage.getItem('userToken')}`,
        },
      }
    );
  }
  removeToFavorites(id: any) {
    return this.http.delete(
      `${this.baseUrl}/removeWishList/${id}`,

      {
        headers: {
          authorization: `Bearer__${localStorage.getItem('userToken')}`,
        },
      }
    );
  }
  deleteFromCart(data: any) {
    return this.http.put(`${this.baseUrl}/deleteFromCart`, data);
  }
  getCart(token: any) {
    return this.http.get(`${this.baseUrl}/getCart/${token}`);
  }

  changeQuantityOfProductInCart(token: any, product: any) {
    return this.http.patch(
      `${this.baseUrl}/changeQuantityOfProductInCart/${token}`,
      product
    );
  }
}
