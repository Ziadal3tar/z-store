import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { isAuthTokenValid } from 'src/app/core/auth-token.util';
import {
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';

import { Product } from 'src/app/core/models/product.model';
import { UserStateService } from 'src/app/core/state/user-state.service';
import { CatalogStateService } from 'src/app/core/state/catalog-state.service';

import { CartService } from './../../services/cart.service';
import { WishListService } from './../../services/wish-list.service';

interface PriceRange {
  min: number | null;
  max: number | null;
}

type SortOption =
  | 'featured'
  | 'newest'
  | 'price-low'
  | 'price-high'
  | 'name';

@Component({
  selector: 'app-allproduct',
  templateUrl: './allproduct.component.html',
  styleUrls: ['./allproduct.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllproductComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();
  private readonly searchInput$ = new Subject<string>();

  userData: any;
  hasActiveFilters = false;

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  products: Product[] = [];

  searchTerm = '';
  sortBy: SortOption = 'featured';

  selectedColor = '';
  selectedPrice: PriceRange = {
    min: null,
    max: null,
  };

  showFilters = false;
  loginFirst = false;

  isLoading = true;

  productDetails?: Product;
  openProductDetails = false;

  currentPage = 1;
  pageSize = 12;
  totalPages = 0;
  totalProducts = 0;
  paginationPages: Array<number | string> = [];

  readonly skeletonItems = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
  ];

  readonly favoriteBusyIds = new Set<string>();
  readonly cartBusyIds = new Set<string>();
  favoriteBusy: Record<string, boolean> = {};
  cartBusy: Record<string, boolean> = {};
  private wishlistIds = new Set<string>();

  readonly colors = [
    'black',
    'red',
    'blue',
    'green',
    'yellow',
    'white',
    'orange',
    'brown',
    'gray',
    'pink',
    'beige',
    'navy',
  ];

  readonly priceRanges: Array<{
    label: string;
    range: PriceRange;
  }> = [
    {
      label: 'Under $50',
      range: {
        min: null,
        max: 50,
      },
    },
    {
      label: '$50 – $100',
      range: {
        min: 50,
        max: 100,
      },
    },
    {
      label: '$100 – $250',
      range: {
        min: 100,
        max: 250,
      },
    },
    {
      label: '$250 – $500',
      range: {
        min: 250,
        max: 500,
      },
    },
    {
      label: '$500+',
      range: {
        min: 500,
        max: null,
      },
    },
  ];

  constructor(
    private readonly userState: UserStateService,
    private readonly catalogState: CatalogStateService,
    private readonly cartService: CartService,
    private readonly wishListService: WishListService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.searchInput$
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe((value) => {
          this.searchTerm = value.trim();
          this.currentPage = 1;
          this.loadProducts();
        })
    );

    this.subscriptions.add(
      this.userState.user$.subscribe((user) => {
        this.userData = user;
        this.wishlistIds = new Set(
          (user?.wishlist ?? [])
            .map((item: Product) => item?._id)
            .filter((id): id is string => !!id)
        );
        this.applyLocalFilters();
        this.cdr.markForCheck();
      })
    );

    this.subscriptions.add(
      this.catalogState.products$.subscribe(
        (products: Product[]) => {
          this.allProducts = Array.isArray(products)
            ? products
            : [];

          this.isLoading = false;

          this.applyLocalFilters();

          this.cdr.markForCheck();
        }
      )
    );

    this.subscriptions.add(
      this.catalogState.productPagination$.subscribe(
        (pagination) => {
          this.currentPage = pagination.page;
          this.pageSize = pagination.limit;
          this.totalPages = pagination.totalPages;
          this.totalProducts = pagination.total;
          this.updatePaginationPages();

          this.cdr.markForCheck();
        }
      )
    );

    this.loadInitialState();
  }

  ngOnDestroy(): void {
    this.searchInput$.complete();
    this.subscriptions.unsubscribe();
  }

  private loadProducts(): void {
    this.isLoading = true;

    this.catalogState.refreshProducts(
      this.currentPage,
      this.pageSize,
      this.searchTerm
    );

    this.cdr.markForCheck();
  }

  private loadInitialState(): void {
    this.isLoading = true;

    this.loadProducts();

    if (this.userState.snapshot) {
      return;
    }

    if (this.hasAuthToken()) {
      this.userState.refresh();
    }
  }

  private hasAuthToken(): boolean {
    return isAuthTokenValid();
  }

  private applyLocalFilters(): void {
    let result = [...this.allProducts];

    this.hasActiveFilters = !!this.searchTerm.trim()
      || !!this.selectedColor
      || this.selectedPrice.min != null
      || this.selectedPrice.max != null;

    const price = this.selectedPrice;

    if (
      price.min != null ||
      price.max != null
    ) {
      result = result.filter((product) => {
        const value = this.finalPrice(product);

        const matchesMin =
          price.min == null ||
          value >= price.min;

        const matchesMax =
          price.max == null ||
          value <= price.max;

        return matchesMin && matchesMax;
      });
    }

    if (this.selectedColor) {
      result = result.filter((product) => {
        return (product.colors ?? []).some(
          (color) =>
            color.toLowerCase() ===
            this.selectedColor.toLowerCase()
        );
      });
    }

    result.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return (
            this.dateValue(
              b.updatedAt || b.createdAt
            ) -
            this.dateValue(
              a.updatedAt || a.createdAt
            )
          );

        case 'price-low':
          return (
            this.finalPrice(a) -
            this.finalPrice(b)
          );

        case 'price-high':
          return (
            this.finalPrice(b) -
            this.finalPrice(a)
          );

        case 'name':
          return a.name.localeCompare(b.name);

        default:
          return (
            Number(b.soldItems ?? 0) -
            Number(a.soldItems ?? 0)
          );
      }
    });

    this.filteredProducts = result;
    this.products = result.map((product) => this.toViewProduct(product));
  }

  onSearchChange(value: string): void {
    this.searchInput$.next(value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchInput$.next('');

    this.searchTerm = '';
    this.sortBy = 'featured';
    this.selectedColor = '';

    this.selectedPrice = {
      min: null,
      max: null,
    };

    this.showFilters = false;

    this.applyLocalFilters();
  }

  selectPrice(range: PriceRange): void {
    this.selectedPrice = {
      ...range,
    };

    this.applyLocalFilters();
  }

  clearPriceFilter(): void {
    this.selectedPrice = {
      min: null,
      max: null,
    };

    this.applyLocalFilters();
  }

  selectColor(color: string): void {
    this.selectedColor =
      this.selectedColor === color
        ? ''
        : color;

    this.applyLocalFilters();
  }

  clearColorFilter(): void {
    this.selectedColor = '';
    this.applyLocalFilters();
  }

  onSortChange(value: SortOption): void {
    this.sortBy = value;
    this.applyLocalFilters();
  }

  goToPage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;
    this.loadProducts();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  private updatePaginationPages(): void {
    if (this.totalPages <= 7) {
      this.paginationPages = Array.from(
        { length: this.totalPages },
        (_, index) => index + 1
      );
      return;
    }

    const pages: Array<number | string> = [1];

    if (this.currentPage > 4) {
      pages.push('…');
    }

    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(this.totalPages - 1, this.currentPage + 1);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    if (this.currentPage < this.totalPages - 3) {
      pages.push('…');
    }

    pages.push(this.totalPages);
    this.paginationPages = pages;
  }

  private finalPrice(product: Product): number {
    const price = Number(product.price ?? 0);

    return product.finalPrice != null
      ? Number(product.finalPrice)
      : Math.max(0, price - Number(product.discount ?? 0));
  }

  private toViewProduct(product: Product): Product {
    const price = Number(product.price ?? 0);
    const finalPrice = this.finalPrice(product);

    const discountPercent = product.discount != null
      ? Number(product.discount)
      : price > 0 && finalPrice < price
        ? Math.round(((price - finalPrice) / price) * 100)
        : 0;

    const image = product.images?.[0];
    const rawImageUrl = typeof image === 'string'
      ? image
      : image?.url ?? 'assets/placeholder.png';

    const imageUrl = this.optimizeCloudinaryImage(rawImageUrl);

    return {
      ...product,
      displayImageUrl: imageUrl,
      displayFinalPrice: finalPrice,
      displayOldPrice: finalPrice < price ? price : null,
      displayDiscountPercent: discountPercent,
      isWishlisted: !!product._id && this.wishlistIds.has(product._id),
    };
  }

  private optimizeCloudinaryImage(url: string): string {
    if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
      return url;
    }

    if (url.includes('/f_auto,q_auto') || url.includes('/q_auto,f_auto')) {
      return url;
    }

    return url.replace(
      '/upload/',
      '/upload/f_auto,q_auto,w_600,c_limit/'
    );
  }


  addToCart(product: Product): void {
    if (!this.userData) {
      this.loginFirst = true;
      this.cdr.markForCheck();
      return;
    }

    if (
      !product._id ||
      this.cartBusy[product._id]
    ) {
      return;
    }

    this.cartBusyIds.add(product._id);
    this.cartBusy = { ...this.cartBusy, [product._id]: true };

    this.cdr.markForCheck();

    this.cartService
      .addToCart({
        productId: product._id,
        quantity: 1,
      }, product)
      .subscribe({
        next: () => {
          const currentUser = this.userData;

          if (currentUser) {
            const currentCart = currentUser.cartId ?? { products: [] };
            const currentProducts = currentCart.products ?? [];
            const existing = currentProducts.find(
              (item:any) => item.productId?._id === product._id
            );

            const nextProducts = existing
              ? currentProducts.map((item:any) =>
                  item.productId?._id === product._id
                    ? { ...item, quantity: 1 }
                    : item
                )
              : [
                  ...currentProducts,
                  { productId: product, quantity: 1 },
                ];

            this.userState.setUserData({
              ...currentUser,
              cartId: { ...currentCart, products: nextProducts },
            });
          }

          this.cartBusyIds.delete(product._id as string);
          this.cartBusy = { ...this.cartBusy, [product._id as string]: false };
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'Add to cart failed:',
            error
          );

          this.cartBusyIds.delete(product._id as string);
          this.cartBusy = { ...this.cartBusy, [product._id as string]: false };
          this.cdr.markForCheck();
        },
      });
  }


  addToFavorites(product: Product): void {
    if (!this.userData) {
      this.loginFirst = true;
      this.cdr.markForCheck();
      return;
    }

    if (
      !product._id ||
      this.favoriteBusy[product._id]
    ) {
      return;
    }

    this.favoriteBusyIds.add(product._id);
    this.favoriteBusy = { ...this.favoriteBusy, [product._id]: true };

    this.cdr.markForCheck();

    const request = product.isWishlisted
      ? this.wishListService.removeToFavorites(product._id)
      : this.wishListService.addToFavorites({ productId: product._id });

    request.subscribe({
      next: (response: any) => {
        if (response?.message === 'Done') {
          const id = product._id as string;
          this.wishlistIds = new Set(this.wishlistIds);
          if (product.isWishlisted) {
            this.wishlistIds.delete(id);
          } else {
            this.wishlistIds.add(id);
          }
          this.applyLocalFilters();
        }

        this.favoriteBusyIds.delete(product._id as string);
        this.favoriteBusy = { ...this.favoriteBusy, [product._id as string]: false };
        this.cdr.markForCheck();
      },

      error: (error: any) => {
        console.error(
          'Wishlist update failed:',
          error
        );

        this.favoriteBusyIds.delete(product._id as string);
        this.favoriteBusy = { ...this.favoriteBusy, [product._id as string]: false };
        this.cdr.markForCheck();
      },
    });
  }


  openQuickView(product: Product): void {
    this.productDetails = product;
    this.openProductDetails = true;

    this.cdr.markForCheck();
  }

  closeQuickView(): void {
    this.openProductDetails = false;
    this.productDetails = undefined;

    this.cdr.markForCheck();
  }

  viewProduct(product: Product): void {
    if (!product._id) {
      return;
    }

    this.router.navigate([
      '/product',
      product._id,
    ]);
  }

  trackByProductId(
    index: number,
    product: Product
  ): string | number {
    return product._id ?? index;
  }

  private dateValue(
    value?: string
  ): number {
    if (!value) {
      return 0;
    }

    const time = new Date(value).getTime();

    return Number.isNaN(time)
      ? 0
      : time;
  }
}
