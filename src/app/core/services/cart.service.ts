import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Cart } from '../models/cart.model';
import { Product } from '../models/product.model';

interface CartResponse {
  message?: string;
  cart: Cart;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly baseUrl = `${environment.apiUrl}/cart`;
  private readonly cartSubject = new BehaviorSubject<Cart>({ products: [] });
  readonly cart$ = this.cartSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  get snapshot(): Cart {
    return this.cartSubject.value;
  }

  getMyCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.baseUrl}/me`).pipe(
      tap(response => this.setCart(response?.cart)),
    );
  }

  loadCart(): Observable<CartResponse> {
    return this.getMyCart();
  }

  addToCart(
    payload: { productId: string; quantity: number },
    previewProduct?: Product,
  ): Observable<CartResponse> {
    const previous = this.snapshot;
    const quantity = Math.max(1, Number(payload.quantity) || 1);
    const products = [...previous.products];
    const index = products.findIndex(item => String(item.productId?._id) === String(payload.productId));

    if (index >= 0) {
      products[index] = {
        ...products[index],
        quantity: Number(products[index].quantity || 0) + quantity,
      };
    } else {
      products.push({
        productId: (previewProduct ?? { _id: payload.productId }) as Product,
        quantity,
      });
    }

    this.setCart({ ...previous, products });

    return this.http.post<CartResponse>(`${this.baseUrl}/createCart`, {
      productId: payload.productId,
      quantity,
    }).pipe(
      tap(response => this.setCart(response?.cart)),
      catchError(error => {
        this.setCart(previous);
        return throwError(() => error);
      }),
    );
  }

  removeFromCart(productId: string): Observable<CartResponse> {
    const previous = this.snapshot;
    this.setCart({
      ...previous,
      products: previous.products.filter(item => String(item.productId?._id) !== String(productId)),
    });

    return this.http.put<CartResponse>(`${this.baseUrl}/deleteFromCart`, { productId }).pipe(
      tap(response => this.setCart(response?.cart)),
      catchError(error => {
        this.setCart(previous);
        return throwError(() => error);
      }),
    );
  }

  updateQuantity(productId: string, quantity: number): Observable<CartResponse> {
    const previous = this.snapshot;
    const nextQuantity = Math.max(1, Number(quantity) || 1);

    this.setCart({
      ...previous,
      products: previous.products.map(item =>
        String(item.productId?._id) === String(productId)
          ? { ...item, quantity: nextQuantity }
          : item,
      ),
    });

    return this.http.patch<CartResponse>(`${this.baseUrl}/changeQuantity`, {
      productId,
      quantity: nextQuantity,
    }).pipe(
      tap(response => this.setCart(response?.cart)),
      catchError(error => {
        this.setCart(previous);
        return throwError(() => error);
      }),
    );
  }

  // Compatibility for legacy callers.
  updateQuantityLegacy(_token: string, payload: { productId: string; quantity: number }): Observable<CartResponse> {
    return this.updateQuantity(payload.productId, payload.quantity);
  }

  setCart(cart: Cart | null | undefined): void {
    this.cartSubject.next(cart ?? { products: [] });
  }

  clear(): void {
    this.setCart({ products: [] });
  }
}
