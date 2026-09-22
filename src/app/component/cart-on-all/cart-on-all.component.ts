import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { CartItem } from 'src/app/core/models/cart.model';
import { User } from 'src/app/core/models/user.model';
import { UserStateService } from 'src/app/core/state/user-state.service';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart-on-all',
  templateUrl: './cart-on-all.component.html',
  styleUrls: ['./cart-on-all.component.css'],
})
export class CartOnAllComponent {
  @Input() sideCart = '';
  @Input() cartlength = 0;
  @Input() userData: User | undefined;
  @Input() subtotal: number | string | null | undefined;

  @Output() closeCart = new EventEmitter<string>();

  constructor(
    private readonly cartService: CartService,
    private readonly userStateService: UserStateService,
    private readonly router: Router,
  ) {}

  get cartItems(): CartItem[] {
    return this.userData?.cartId?.products ?? [];
  }

  get displayedSubtotal(): number {
    const providedSubtotal = Number(this.subtotal);

    if (Number.isFinite(providedSubtotal) && providedSubtotal >= 0) {
      return providedSubtotal;
    }

    return this.cartItems.reduce((total, item) => total + this.itemTotal(item), 0);
  }

  imageUrl(item: CartItem): string {
    const image = item.productId?.images?.[0];
    return typeof image === 'string'
      ? image
      : image?.url || 'assets/images/placeholder-product.png';
  }

  itemTotal(item: CartItem): number {
    const price = Number(item.productId?.finalPrice ?? 0);
    const quantity = Number(item.quantity ?? 0);

    return Number((price * quantity).toFixed(2));
  }

  trackByProduct(index: number, item: CartItem): string | number {
    return item.productId?._id ?? index;
  }

  deleteFromCart(productId?: string): void {
    if (!productId || !this.userData?._id) {
      return;
    }

    this.cartService.removeFromCart({
      productId,
      userId: this.userData._id,
    }).subscribe({
      next: () => {
        this.userStateService.refresh();
      },
      error: (error: unknown) => {
        console.error('Failed to remove product from cart:', error);
      },
    });
  }

  backCart(): void {
    this.sideCart = '';
    this.closeCart.emit('');
  }

  openCart(): void {
    this.router.navigate(['/cart']);
    this.backCart();
  }
}
