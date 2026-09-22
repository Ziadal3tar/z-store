import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CartService } from 'src/app/services/cart.service';
import { ProductsService } from 'src/app/services/products.service';
import { UserStateService } from 'src/app/core/state/user-state.service';
import { WishListService } from 'src/app/services/wish-list.service';

import {
  Product,
  ProductImageValue,
} from 'src/app/core/models/product.model';

import { SeoService } from 'src/app/core/services/seo.service';
import { RecentlyViewedService } from 'src/app/core/services/recently-viewed.service';

@Component({
  selector: 'app-products-details',
  templateUrl: './products-details.component.html',
  styleUrls: ['./products-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsDetailsComponent
  implements OnInit, OnChanges, OnDestroy
{
  private readonly subscriptions = new Subscription();

  @Input() productDetails?: Product;

  userData: any = null;

  routeMode = false;

  isLoading = false;
  isDeleting = false;
  errorMessage = '';

  indexx = 0;
  quantity = 1;

  message = '';
  isAdding = false;
  wishlistBusy = false;

  selectedColor = '';
  selectedSize = '';

  loginFirst = false;

  constructor(
    private readonly userStateService: UserStateService,
    private readonly cartService: CartService,
    private readonly wishListService: WishListService,
    private readonly productsService: ProductsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly seo: SeoService,
    private readonly recentlyViewed: RecentlyViewedService
  ) {}

  ngOnInit(): void {
    this.userStateService.refresh();

    /*
     * Keep the component synchronized with the current user.
     */
    this.subscriptions.add(
      this.userStateService.user$.subscribe((user) => {
        this.userData = user;
        this.cdr.markForCheck();
      })
    );

    /*
     * When the component is used through a route,
     * load the product using the route id.
     */
    this.subscriptions.add(
      this.route.paramMap.subscribe((params) => {
        const id = params.get('id');

        if (id && !this.productDetails) {
          this.routeMode = true;
          this.loadProduct(id);
        }
      })
    );

    /*
     * When the component is embedded and the product
     * comes through @Input, ngOnChanges handles it.
     */
    if (this.productDetails) {
      this.trackRecentlyViewed();
      this.updateProductSeo();
      this.resetProductState();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productDetails']?.currentValue) {
      this.trackRecentlyViewed();
      this.updateProductSeo();
      this.resetProductState();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Check whether current user is admin.
   *
   * Supports both:
   * - isAdmin: true
   * - role: "admin"
   */
  get isAdmin(): boolean {
    return (
      this.userData?.isAdmin === true ||
      String(this.userData?.role ?? '').toLowerCase() === 'admin'
    );
  }

  /**
   * Load product by id.
   */
  private loadProduct(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.subscriptions.add(
      this.productsService.getProductById(id).subscribe({
        next: (response: any) => {
          this.productDetails = response?.product;

          if (!this.productDetails) {
            this.errorMessage = 'Product information is unavailable.';
            this.isLoading = false;
            this.cdr.markForCheck();
            return;
          }

          this.trackRecentlyViewed();
          this.updateProductSeo();
          this.resetProductState();

          this.isLoading = false;

          this.cdr.markForCheck();
        },

        error: () => {
          this.errorMessage = 'We could not load this product.';
          this.isLoading = false;

          this.cdr.markForCheck();
        },
      })
    );
  }

  /**
   * Delete product.
   *
   * The UI will only expose this action to admins,
   * but the backend authorization remains the real protection.
   */
  deleteProduct(): void {
    const productId = this.productDetails?._id;

    if (!this.isAdmin || !productId || this.isDeleting) {
      return;
    }

    const productName = this.productDetails?.name ?? 'this product';

    const confirmed = window.confirm(
      `Delete "${productName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;
    this.errorMessage = '';
    this.message = '';
    this.cdr.markForCheck();

    this.subscriptions.add(
      this.productsService.deleteProduct(String(productId)).subscribe({
        next: () => {
          this.isDeleting = false;
          this.message = 'Product deleted successfully.';
          this.cdr.markForCheck();

          this.router.navigate(['/shop']);
        },

        error: (error) => {
          this.isDeleting = false;

          this.errorMessage =
            error?.error?.message ??
            'Could not delete this product.';

          this.cdr.markForCheck();
        },
      })
    );
  }

  /**
   * Add the product to Recently Viewed.
   */
  private trackRecentlyViewed(): void {
    if (this.productDetails?._id) {
      this.recentlyViewed.add(this.productDetails);
    }
  }

  /**
   * Reset local state when switching products.
   */
  private resetProductState(): void {
    this.indexx = 0;
    this.quantity = 1;

    this.message = '';
    this.isAdding = false;
    this.wishlistBusy = false;
    this.isDeleting = false;

    this.selectedColor = this.productDetails?.colors?.[0] ?? '';
    this.selectedSize = this.productDetails?.sizes?.[0] ?? '';

    this.cdr.markForCheck();
  }

  /**
   * Update page metadata.
   */
  private updateProductSeo(): void {
    const product = this.productDetails;

    if (!product) {
      return;
    }

    const description = String(
      product.description ??
        'Discover product details, pricing and availability on Z-Store.'
    ).slice(0, 155);

    this.seo.setPage(
      String(product.name ?? 'Product'),
      description
    );
  }

  /**
   * Product images.
   */
  get images(): ProductImageValue[] {
    return this.productDetails?.images ?? [];
  }

  /**
   * Return a usable image url.
   */
  imageUrl(image: ProductImageValue | undefined): string {
    if (typeof image === 'string') {
      return image;
    }

    return image?.url ?? 'assets/placeholder.png';
  }

  /**
   * Main image.
   */
  mainImageUrl(): string {
    return this.imageUrl(this.images[this.indexx]);
  }

  /**
   * Next image.
   */
  nextImage(): void {
    if (this.images.length <= 1) {
      return;
    }

    this.indexx =
      this.indexx >= this.images.length - 1
        ? 0
        : this.indexx + 1;

    this.cdr.markForCheck();
  }

  /**
   * Previous image.
   */
  previousImage(): void {
    if (this.images.length <= 1) {
      return;
    }

    this.indexx =
      this.indexx <= 0
        ? this.images.length - 1
        : this.indexx - 1;

    this.cdr.markForCheck();
  }

  /**
   * Track images by index.
   */
  trackByImage(index: number): number {
    return index;
  }

  /**
   * Calculate final price.
   */
  finalPrice(): number {
    const product = this.productDetails;

    if (!product) {
      return 0;
    }

    if (product.finalPrice != null) {
      return Number(product.finalPrice);
    }

    return Math.max(
      0,
      Number(product.price ?? 0) -
        Number(product.discount ?? 0)
    );
  }

  /**
   * Return original price when there is a discount.
   */
  oldPrice(): number | null {
    const product = this.productDetails;

    if (!product) {
      return null;
    }

    const price = Number(product.price ?? 0);

    return this.finalPrice() < price
      ? price
      : null;
  }

  /**
   * Calculate discount percentage.
   */
  discountPercent(): number {
    const product = this.productDetails;

    if (!product) {
      return 0;
    }

    /*
     * Keep compatibility with the existing API shape.
     */
    if (
      product.discount != null &&
      product.discount > 0 &&
      product.price
    ) {
      const price = Number(product.price);
      const discountValue = Number(product.discount);

      /*
       * If discount looks like a percentage, use it directly.
       * Otherwise calculate the percentage from final price.
       */
      if (discountValue <= 100) {
        const calculated =
          price > 0
            ? Math.round(
                ((price - this.finalPrice()) / price) *
                  100
              )
            : 0;

        return calculated > 0
          ? calculated
          : Math.round(discountValue);
      }
    }

    const oldPrice = Number(product.price ?? 0);
    const current = this.finalPrice();

    if (oldPrice <= 0 || current >= oldPrice) {
      return 0;
    }

    return Math.round(
      ((oldPrice - current) / oldPrice) * 100
    );
  }

  /**
   * Available stock.
   */
  availableStock(): number | any {
    if (this.productDetails?.stock == null) {
      return null;
    }

    return Math.max(
      0,
      Number(this.productDetails.stock)
    );
  }

  /**
   * Whether the product can be added to cart.
   */
  canAddToCart(): boolean {
    return (
      !!this.productDetails &&
      (
        this.availableStock() == null ||
        this.availableStock()! > 0
      )
    );
  }

  /**
   * Increase quantity.
   */
  increment(): void {
    const stock = this.availableStock();

    if (
      stock != null &&
      this.quantity >= stock
    ) {
      this.message =
        `Only ${stock} item${stock === 1 ? '' : 's'} available.`;

      this.cdr.markForCheck();

      return;
    }

    this.quantity += 1;
    this.message = '';

    this.cdr.markForCheck();
  }

  /**
   * Decrease quantity.
   */
  decrement(): void {
    if (this.quantity <= 1) {
      this.message = 'Minimum quantity is 1.';

      this.cdr.markForCheck();

      return;
    }

    this.quantity -= 1;
    this.message = '';

    this.cdr.markForCheck();
  }

  /**
   * Add/remove product from wishlist.
   */
  toggleFavorite(): void {
    if (!this.userData) {
      this.loginFirst = true;
      this.cdr.markForCheck();

      return;
    }

    const id = this.productDetails?._id;

    if (!id || this.wishlistBusy) {
      return;
    }

    const alreadyFavorite = this.isFavorite();

    this.wishlistBusy = true;
    this.cdr.markForCheck();

    const request = alreadyFavorite
      ? this.wishListService.removeToFavorites(id)
      : this.wishListService.addToFavorites({
          productId: id,
        });

    this.subscriptions.add(
      request.subscribe({
        next: (response: any) => {
          this.wishlistBusy = false;

          if (response?.message === 'Done') {
            this.userStateService.refresh();
          }

          this.cdr.markForCheck();
        },

        error: () => {
          this.wishlistBusy = false;

          this.cdr.markForCheck();
        },
      })
    );
  }

  /**
   * Check whether the product is currently in wishlist.
   */
  isFavorite(): boolean {
    const id = this.productDetails?._id;

    if (!id) {
      return false;
    }

    return !!this.userData?.wishlist?.some(
      (item: any) => item?._id === id
    );
  }

  /**
   * Add product to cart.
   */
  addToCart(): void {
    if (!this.userData) {
      this.loginFirst = true;
      this.cdr.markForCheck();

      return;
    }

    const id = this.productDetails?._id;

    if (
      !id ||
      !this.canAddToCart() ||
      this.isAdding
    ) {
      return;
    }

    this.isAdding = true;
    this.message = '';

    this.cdr.markForCheck();

    this.subscriptions.add(
      this.cartService
        .addToCart({
          productId: id,
          quantity: this.quantity,
        })
        .subscribe({
          next: () => {
            this.isAdding = false;
            this.quantity = 1;
            this.message = 'Added to cart.';

            this.userStateService.refresh();

            this.cdr.markForCheck();
          },

          error: (error) => {
            this.isAdding = false;

            this.message =
              error?.error?.message ||
              'Could not add this product to cart.';

            this.cdr.markForCheck();
          },
        })
    );
  }

  /**
   * Back to the products page.
   */
  continueShopping(): void {
    this.router.navigate(['/shop']);
  }
}
