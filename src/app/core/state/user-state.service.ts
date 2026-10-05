import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, shareReplay, finalize, catchError, map, tap } from 'rxjs';

import { clearAuthToken, getAuthToken } from 'src/app/core/auth-token.util';
import { Cart } from 'src/app/core/models/cart.model';
import { User } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';
import { CartService } from 'src/app/core/services/cart.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private readonly userSubject = new BehaviorSubject<User | undefined>(undefined);
  private refreshInFlight?: Observable<User | undefined>;

  readonly user$ = this.userSubject.asObservable();

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly cartService: CartService,
  ) {
    this.cartService.cart$.subscribe(cart => {
      const user = this.snapshot;
      if (!user || !cart) return;
      this.setUserData({
        ...user,
        cartId: cart,
        cart: Boolean(cart.products?.length),
      });
    });
  }

  get snapshot(): User | undefined {
    return this.userSubject.value;
  }

  setUserData(user: User | null | undefined): void {
    this.userSubject.next(user ?? undefined);
  }

  refresh(): Observable<User | undefined> {
    const token = getAuthToken();
    if (!token) {
      this.clear();
      return of(undefined);
    }

    if (!this.refreshInFlight) {
      this.refreshInFlight = this.userService.getCurrentUser().pipe(
        map((response: any) => response.user ?? response.userData),
        tap((user) => this.setUserData(user)),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            clearAuthToken();
            this.clear();
            if (this.router.url !== '/login') {
              void this.router.navigate(['/login']);
            }
          }
          return of(undefined);
        }),
        finalize(() => {
          this.refreshInFlight = undefined;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }

    return this.refreshInFlight;
  }

  clear(): void {
    this.userSubject.next(undefined);
  }

  updateWishlist(productId: string, add: boolean): void {
    const user = this.snapshot;
    if (!user || !productId) return;

    const wishlist = Array.isArray(user.wishlist) ? [...user.wishlist] : [];
    const next = add
      ? [...wishlist.filter(item => item?._id !== productId), { _id: productId }]
      : wishlist.filter(item => item?._id !== productId);

    this.setUserData({ ...user, wishlist: next as any });
  }

  updateCart(cart: Cart | null | undefined): void {
    const user = this.snapshot;
    if (!user) return;
    const nextCart = cart ?? { products: [] };
    this.setUserData({
      ...user,
      cartId: nextCart,
      cart: Boolean(nextCart.products?.length),
    });
  }
}
