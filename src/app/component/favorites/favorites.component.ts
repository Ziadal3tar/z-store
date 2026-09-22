import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { CartService } from 'src/app/services/cart.service';
import { WishListService } from 'src/app/services/wish-list.service';
import { Product, ProductImageValue } from 'src/app/core/models/product.model';
import { User } from 'src/app/core/models/user.model';
import { UserStateService } from 'src/app/core/state/user-state.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesComponent implements OnChanges, OnDestroy {
  @Input() userData: User | undefined;

  favoriteProducts: Product[] = [];
  addingToCartId: string | null = null;
  removingProductId: string | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly cartService: CartService,
    private readonly wishListService: WishListService,
    private readonly userState: UserStateService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData']) {
      this.syncFavorites();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addToCart(id: string | undefined): void {
    if (!id || this.addingToCartId === id) {
      return;
    }

    this.addingToCartId = id;
    this.cdr.markForCheck();

    this.cartService
      .addToCart({
        productId: id,
        quantity: 1,
      })
      .pipe(
        finalize(() => {
          this.addingToCartId = null;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => this.userState.refresh(),
        error: error => console.error('add to cart failed', error),
      });
  }

  color(event: Event, id: string | undefined): void {
    event.stopPropagation();

    if (!id || this.removingProductId === id) {
      return;
    }

    const target = event.currentTarget as HTMLElement | null;
    const isActiveFavorite = target?.classList.contains('text-danger');

    if (isActiveFavorite) {
      this.removeFavorite(id, event);
      return;
    }

    this.addFavorite(id, target);
  }

  ondrop(event: CdkDragDrop<Product[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    moveItemInArray(
      this.favoriteProducts,
      event.previousIndex,
      event.currentIndex,
    );

    this.favoriteProducts = [...this.favoriteProducts];
    this.cdr.markForCheck();
  }

  trackByProductId(index: number, product: Product): string | number {
    return product?._id ?? index;
  }

  imageUrl(product: Product): string {
    const firstImage: ProductImageValue | undefined = product.images?.[0];

    if (typeof firstImage === 'string') {
      return firstImage;
    }

    return firstImage?.url ?? 'assets/images/placeholder-product.png';
  }

  private addFavorite(id: string, target: HTMLElement | null): void {
    this.removingProductId = id;

    this.wishListService
      .addToFavorites({ productId: id })
      .pipe(
        finalize(() => {
          this.removingProductId = null;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          target?.classList.remove('removed');
          target?.classList.add('text-danger');
          this.userState.refresh();
        },
        error: error => console.error('add favorite failed', error),
      });
  }

  removeFavorite(id: string | undefined, event: Event): void {
    event.stopPropagation();

    if (!id || this.removingProductId === id) {
      return;
    }

    const target = event.currentTarget as HTMLElement | null;
    this.removingProductId = id;

    this.wishListService
      .removeToFavorites(id)
      .pipe(
        finalize(() => {
          this.removingProductId = null;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          target?.classList.remove('text-danger');
          target?.classList.add('removed');
          this.favoriteProducts = this.favoriteProducts.filter(
            product => product._id !== id,
          );
          this.userState.refresh();
          this.cdr.markForCheck();
        },
        error: error => console.error('remove favorite failed', error),
      });
  }

  private syncFavorites(): void {
    const wishlist = this.userData?.wishlist ?? [];
    this.favoriteProducts = [...wishlist];
    this.cdr.markForCheck();
  }
}
