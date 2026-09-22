import { getAuthToken } from 'src/app/core/auth-token.util';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({ providedIn: 'root' })
export class CartService {
  private baseUrl = `${environment.apiUrl}/cart`;

  private cartSubject = new BehaviorSubject<any>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadCart(token: any) {
       return this.http.get(`${this.baseUrl}/getCart/${token}`)
.pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  addToCart(product: any) {
    return this.http.post(`${this.baseUrl}/createCart`, product,

      {
        headers: {
          authorization: `Bearer__${getAuthToken()}`,
        },
      }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  removeFromCart(productId: any) {
    return this.http
      .put(`${this.baseUrl}/deleteFromCart`, { productId })
      .pipe(tap(cart => this.cartSubject.next(cart)));
  }

  updateQuantity(token: any, product: any) {
    return this.http.patch(
      `${this.baseUrl}/changeQuantityOfProductInCart/${token}`,
      product
    )
      .pipe(tap(cart => this.cartSubject.next(cart)));
  }

  clearCart() {
    this.cartSubject.next({ items: [], totalPrice: 0 });
  }
}

