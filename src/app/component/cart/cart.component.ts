import { getAuthToken } from 'src/app/core/auth-token.util';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Cart, CartItem } from 'src/app/core/models/cart.model';
import { User } from 'src/app/core/models/user.model';
import { UserStateService } from 'src/app/core/state/user-state.service';
import { CartService } from 'src/app/services/cart.service';
import { CouponService } from 'src/app/services/coupon.service';
import { CheckoutService } from 'src/app/core/services/checkout.service';

interface CouponResponse {
  message?: string;
  coupon?: {
    amount?: number;
  };
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  userData: User | undefined;
  cart: Cart = { products: [] };

  subtotal = 0;
  discountAmount = 0;
  total = 0;
  coupon = '';
  appliedCoupon = '';
  couponError = '';
  isApplyingCoupon = false;
  loading = true;
  busyProductId = '';
  quantityErrorIndex = -1;
  quantityErrorMessage = '';

  constructor(
    private readonly userStateService: UserStateService,
    private readonly cartService: CartService,
    private readonly couponService: CouponService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly checkoutService: CheckoutService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.userStateService.user$.subscribe(user => {
        this.userData = user;
        this.cart = user?.cartId
          ? { ...user.cartId, products: user.cartId.products ?? [] }
          : { products: [] };
        this.recalculateTotals();
        this.loading = false;
        this.cdr.markForCheck();
      }),
    );

    if (!this.userStateService.snapshot && getAuthToken()) {
      this.userStateService.refresh();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get items(): CartItem[] {
    return Array.isArray(this.cart?.products) ? this.cart.products : [];
  }

  get cartCount(): number {
    return this.items.reduce((total, item) => total + Number(item.quantity || 0), 0);
  }

  imageUrl(item: CartItem): string {
    const image = item.productId?.images?.[0];
    if (typeof image === 'string') return image;
    return image?.url ?? 'assets/placeholder.png';
  }

  lineTotal(item: CartItem): number {
    return Number(item.productId?.finalPrice ?? 0) * Number(item.quantity ?? 0);
  }

  recalculateTotals(): void {
    this.subtotal = this.items.reduce((sum, item) => sum + this.lineTotal(item), 0);
    this.discountAmount = Math.min(this.discountAmount, this.subtotal);
    this.total = Math.max(0, this.subtotal - this.discountAmount);
  }

  plus(index: number): void {
    const item = this.items[index];
    if (!item?.productId?._id || this.busyProductId) return;

    const stock = item.productId.stock;
    if (stock != null && item.quantity >= stock) {
      this.showQuantityError(index, `Only ${stock} available.`);
      return;
    }

    this.updateQuantity(index, item.quantity + 1);
  }

  minus(index: number): void {
    const item = this.items[index];
    if (!item?.productId?._id || this.busyProductId) return;

    if (item.quantity <= 1) {
      this.showQuantityError(index, 'Minimum quantity is 1.');
      return;
    }

    this.updateQuantity(index, item.quantity - 1);
  }

  private updateQuantity(index: number, quantity: number): void {
    const item = this.items[index];
    const token = getAuthToken();
    if (!token || !item?.productId?._id) return;

    const previousQuantity = item.quantity;
    item.quantity = quantity;
    this.busyProductId = item.productId._id;
    this.recalculateTotals();
    this.cdr.markForCheck();

    this.cartService.updateQuantity(token, {
      index,
      productId: item.productId._id,
      quantity,
    }).subscribe({
      next: () => {
        this.busyProductId = '';
        this.userStateService.refresh();
        this.cdr.markForCheck();
      },
      error: () => {
        item.quantity = previousQuantity;
        this.busyProductId = '';
        this.recalculateTotals();
        this.showQuantityError(index, 'Could not update the cart.');
        this.cdr.markForCheck();
      },
    });
  }

  deleteFromCart(productId: string): void {
    if (!productId || this.busyProductId) return;

    this.busyProductId = productId;
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        this.busyProductId = '';
        this.appliedCoupon = '';
        this.discountAmount = 0;
        this.userStateService.refresh();
        this.cdr.markForCheck();
      },
      error: () => {
        this.busyProductId = '';
        this.cdr.markForCheck();
      },
    });
  }

  addCoupon(): void {
    const value = this.coupon.trim();
    if (!value || this.isApplyingCoupon || !this.items.length) return;

    this.couponError = '';
    this.isApplyingCoupon = true;

    this.couponService.getCoupon(value).subscribe({
      next: (response: CouponResponse) => {
        const amount = Number(response?.coupon?.amount ?? 0);
        if (response?.message === 'coupon' && amount > 0) {
          this.appliedCoupon = value.toUpperCase();
          this.discountAmount = Number(((this.subtotal * amount) / 100).toFixed(2));
          this.total = Math.max(0, this.subtotal - this.discountAmount);
          this.coupon = '';
        } else {
          this.couponError = 'Invalid coupon.';
        }
        this.isApplyingCoupon = false;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.couponError = error.error?.message || 'Coupon could not be applied.';
        this.isApplyingCoupon = false;
        this.cdr.markForCheck();
      },
    });
  }

  removeCoupon(): void {
    this.appliedCoupon = '';
    this.discountAmount = 0;
    this.recalculateTotals();
  }

  continueShopping(): void {
    this.router.navigate(['/shop']);
  }

  continueToDelivery(): void {
    if (!this.items.length) return;
    this.checkoutService.saveCartContext({
      subtotal: this.subtotal,
      discount: this.discountAmount,
      coupon: this.appliedCoupon || undefined,
    });
    this.router.navigate(['/checkout']);
  }

  trackByProduct(index: number, item: CartItem): string | number {
    return item.productId?._id ?? index;
  }

  private showQuantityError(index: number, message: string): void {
    this.quantityErrorIndex = index;
    this.quantityErrorMessage = message;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.quantityErrorIndex = -1;
      this.quantityErrorMessage = '';
      this.cdr.markForCheck();
    }, 1400);
  }
}
