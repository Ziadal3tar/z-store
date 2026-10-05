import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { CartItem } from 'src/app/core/models/cart.model';
import { User } from 'src/app/core/models/user.model';
import { UserStateService } from 'src/app/core/state/user-state.service';
import { CartService } from 'src/app/core/services/cart.service';

interface CartDrawerItem extends CartItem {
  displayImageUrl: string;
  lineTotal: number;
}

@Component({
  selector: 'app-cart-drawer',
  templateUrl: './cart-drawer.component.html',
  styleUrls: ['./cart-drawer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDrawerComponent implements OnChanges {
  @Input() sideCart = '';
  @Input() userData: User | undefined;

  @Output() closeCart = new EventEmitter<string>();

  displayItems: CartDrawerItem[] = [];
  displaySubtotal = 0;

  constructor(
    private readonly cartService: CartService,
    private readonly userStateService: UserStateService,
    private readonly router: Router,
  ) {}

  ngOnChanges(_changes: SimpleChanges): void {
    this.rebuildView();
  }

  private rebuildView(): void {
    const items = this.userData?.cartId?.products ?? [];
    this.displayItems = items.map(item => {
      const image = item.productId?.images?.[0];
      const price = Number(item.productId?.finalPrice ?? 0);
      const quantity = Number(item.quantity ?? 0);
      return {
        ...item,
        displayImageUrl: typeof image === 'string' ? image : image?.url || 'assets/placeholder.png',
        lineTotal: Number((price * quantity).toFixed(2)),
      };
    });
    this.displaySubtotal = this.displayItems.reduce((total, item) => total + item.lineTotal, 0);
  }


  trackByProduct(index: number, item: CartItem): string | number {
    return item.productId?._id ?? index;
  }

  deleteFromCart(productId?: string): void {
    if (!productId || !this.userData?._id) {
      return;
    }

    const user = this.userData;
    const currentItems = user.cartId?.products ?? [];
    const nextItems = currentItems.filter(
      item => item.productId?._id !== productId
    );

    const nextCart = { ...(user.cartId ?? { products: [] }), products: nextItems };
    this.userStateService.updateCart(nextCart as any);
    this.userData = { ...user, cartId: nextCart as any };
    this.rebuildView();

    this.cartService.removeFromCart(productId).subscribe({
      next: response => {
        this.userStateService.updateCart(response.cart);
      },
      error: (error: unknown) => {
        console.error('Failed to remove product from cart:', error);
        this.userStateService.updateCart(user.cartId ?? { products: [] } as any);
        this.userData = user;
        this.rebuildView();
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
