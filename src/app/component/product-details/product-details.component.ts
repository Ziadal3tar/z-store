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

import { CartService } from 'src/app/core/services/cart.service';
import { ProductsService } from 'src/app/core/services/products.service';
import { UserStateService } from 'src/app/core/state/user-state.service';
import { WishListService } from 'src/app/core/services/wish-list.service';

import {
  Product,
  ProductImageValue,
} from 'src/app/core/models/product.model';

import { SeoService } from 'src/app/core/services/seo.service';
import { RecentlyViewedService } from 'src/app/core/services/recently-viewed.service';
import { RecommendationService } from 'src/app/core/services/recommendation.service';
import { OrderService } from 'src/app/core/services/order.service';
import { CompareService } from 'src/app/core/services/compare.service';
import { Order } from 'src/app/core/models/order.model';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailsComponent
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
  isBuyingNow = false;
  wishlistBusy = false;

  selectedColor = '';
  selectedSize = '';
  recommendations: Product[] = [];
  reviewOrderId = '';
  displayPrice = 0;
  displayOldPrice: number | null = null;
  displayDiscount = 0;
  displayStock: number | null = null;
  productImages: ProductImageValue[] = [];
  hasMultipleImages = false;
  savingPercent = 0;
  availableStockValue: number | null = null;
  isFavoriteValue = false;
  canAddToCart = false;
  isAdminUser = false;
  productImageUrls: string[] = [];
  isCompared = false;
  mainImage = 'assets/placeholder.png';

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
    private readonly recentlyViewed: RecentlyViewedService,
    private readonly recommendationService: RecommendationService,
    private readonly orderService: OrderService,
    private readonly compareService: CompareService
  ) {}

  ngOnInit(): void {
    /*
     * Keep the component synchronized with the current user.
     */
    this.subscriptions.add(
      this.userStateService.user$.subscribe((user) => {
        this.userData = user;
        const productId = this.productDetails?._id;
        this.isFavoriteValue = !!productId && !!user?.wishlist?.some((item: any) => item?._id === productId);
        this.isAdminUser = user?.isAdmin === true || String(user?.role ?? '').toLowerCase() === 'admin';
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
      this.loadRelatedData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productDetails']?.currentValue) {
      this.trackRecentlyViewed();
      this.updateProductSeo();
      this.resetProductState();
      this.loadRelatedData();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
          this.loadRelatedData();

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


  private loadRelatedData(): void {
    const id = this.productDetails?._id;
    if (!id) return;
    this.recommendationService.getForProduct(id).subscribe({
      next: response => {
        this.recommendations = (response.products ?? []).map(product => this.toViewRecommendation(product));
        this.cdr.markForCheck();
      },
      error: () => { this.recommendations = []; this.cdr.markForCheck(); },
    });
    this.orderService.getMyOrders(1, 20).subscribe({
      next: response => {
        const delivered = (response.orders ?? []).find((order: Order) => order.status === 'delivered' && order.items.some(item => item.productId === id));
        this.reviewOrderId = delivered?._id ?? '';
        this.cdr.markForCheck();
      },
      error: () => { this.reviewOrderId = ''; },
    });
  }

  toggleCompare(): void {
    if (!this.productDetails) return;
    this.compareService.toggle(this.productDetails);
    this.isCompared = this.compareService.has(this.productDetails._id);
    this.cdr.markForCheck();
  }

  trackByRecommendation(_: number, product: Product): string | number { return product._id ?? _; }

  viewRecommendation(product: Product): void {
    if (product._id) this.router.navigate(['/product', product._id]);
  }

  private toViewRecommendation(product: Product): Product {
    const rawImage = product.images?.[0];
    return {
      ...product,
      displayImageUrl: typeof rawImage === 'string' ? rawImage : rawImage?.url ?? 'assets/placeholder.png',
      displayFinalPrice: Number(product.finalPrice ?? product.price ?? 0),
    };
  }

  deleteProduct(): void {
    const productId = this.productDetails?._id;

    if (!this.isAdminUser || !productId || this.isDeleting) {
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
      this.productsService.removeProduct(String(productId)).subscribe({
        next: () => {
          this.isDeleting = false;
          this.message = 'Product deleted successfully.';
          this.cdr.markForCheck();

          this.recentlyViewed.remove(productId)
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
    const product = this.productDetails;
    const price = Number(product?.price ?? 0);
    this.displayPrice = Number(product?.finalPrice ?? Math.max(0, price * (1 - Number(product?.discount ?? 0) / 100)));
    this.displayOldPrice = this.displayPrice < price ? price : null;
    this.displayDiscount = Number(product?.discount ?? 0) > 0 ? Number(product?.discount) : (price > 0 && this.displayPrice < price ? Math.round(((price - this.displayPrice) / price) * 100) : 0);
    this.displayStock = product?.stock == null ? null : Math.max(0, Number(product.stock));
    this.productImages = this.productDetails?.images ?? [];
    this.productImageUrls = this.productImages.map(image => this.resolveImageUrl(image));
    this.mainImage = this.productImageUrls[0] ?? 'assets/placeholder.png';
    this.isCompared = this.compareService.has(product?._id);
    this.hasMultipleImages = this.productImages.length > 1;
    this.savingPercent = this.calculateDiscountPercent(price, this.displayPrice, Number(product?.discount ?? 0));
    this.availableStockValue = this.displayStock;
    this.isFavoriteValue = !!product?._id && !!this.userData?.wishlist?.some((item: any) => item?._id === product?._id);
    this.canAddToCart = this.displayStock == null || this.displayStock > 0;
    this.isAdminUser = this.userData?.isAdmin === true || String(this.userData?.role ?? '').toLowerCase() === 'admin';

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
  /**
   * Return a usable image url.
   */
  private resolveImageUrl(image: ProductImageValue | undefined): string {
    if (typeof image === 'string') return image;
    return image?.url ?? 'assets/placeholder.png';
  }


  /**
   * Next image.
   */
  nextImage(): void {
    if (!this.hasMultipleImages) {
      return;
    }

    this.indexx =
      this.indexx >= this.productImages.length - 1
        ? 0
        : this.indexx + 1;

    this.cdr.markForCheck();
  }

  /**
   * Previous image.
   */
  previousImage(): void {
    if (!this.hasMultipleImages) {
      return;
    }

    this.indexx =
      this.indexx <= 0
        ? this.productImages.length - 1
        : this.indexx - 1;

    this.cdr.markForCheck();
  }

  /** Track images by index. */
  trackByImage(index: number): number {
    return index;
  }

  private calculateDiscountPercent(price: number, finalPrice: number, discountValue: number): number {
    if (discountValue > 0 && discountValue <= 100 && price > 0) {
      const calculated = Math.round(((price - finalPrice) / price) * 100);
      return calculated > 0 ? calculated : Math.round(discountValue);
    }
    return price > 0 && finalPrice < price ? Math.round(((price - finalPrice) / price) * 100) : 0;
  }

  /**
   * Whether the product can be added to cart.
   */

  /**
   * Increase quantity.
   */
  increment(): void {
    const stock = this.availableStockValue;

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

    const alreadyFavorite = this.isFavoriteValue;

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
            this.isFavoriteValue = !alreadyFavorite;
            this.userStateService.updateWishlist(id, !alreadyFavorite);
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
      !this.canAddToCart ||
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
        }, this.productDetails)
        .subscribe({
          next: () => {
            this.isAdding = false;
            this.quantity = 1;
            this.message = 'Added to cart.';

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
   * Add the current product to the cart and continue directly to checkout.
   */
  buyNow(): void {
    if (!this.userData) {
      this.loginFirst = true;
      this.cdr.markForCheck();
      return;
    }

    const id = this.productDetails?._id;
    if (!id || !this.canAddToCart || this.isAdding || this.isBuyingNow) return;

    this.isBuyingNow = true;
    this.message = '';
    this.cdr.markForCheck();

    this.subscriptions.add(
      this.cartService.addToCart({ productId: id, quantity: this.quantity }, this.productDetails).subscribe({
        next: response => {
          this.userStateService.updateCart(response.cart);
          this.isBuyingNow = false;
          this.router.navigate(['/checkout']);
          this.cdr.markForCheck();
        },
        error: error => {
          this.isBuyingNow = false;
          this.message = error?.error?.message || 'Could not continue to checkout.';
          this.cdr.markForCheck();
        },
      }),
    );
  }

  /**
   * Back to the products page.
   */
  continueShopping(): void {
    this.router.navigate(['/shop']);
  }
}
