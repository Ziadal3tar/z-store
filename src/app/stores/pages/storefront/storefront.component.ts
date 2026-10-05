import { getAuthToken } from 'src/app/core/auth-token.util';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  Subject,
  Subscription,
} from 'rxjs';

import {
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';

import {
  CartService,
} from '../../../core/services/cart.service';

import {
  UserStateService,
} from '../../../core/state/user-state.service';

import { Product } from '../../../core/models/product.model';
import { StoreProductsService } from '../../services/store-products.service';

import { StoreManagementService } from '../../services/store-management.service';

interface CategoryOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-storefront',
  templateUrl: './storefront.component.html',
  styleUrls: ['./storefront.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorefrontComponent
  implements OnInit, OnDestroy {

  storeId = '';

  store: any = null;

  products: Product[] = [];
  filteredProducts: Product[] = [];

  categories: CategoryOption[] = [
    {
      value: 'all',
      label: 'All',
    },
  ];

  search = '';

  selectedCategory = 'all';

  sortBy:
    | 'popular'
    | 'new'
    | 'price-asc'
    | 'price-desc' =
    'popular';

  minPrice: number | null = null;
  maxPrice: number | null = null;

  loading = true;
  error = '';

  cartCount = 0;

  filtersOpen = false;

  addingProductId: string | null = null;

  readonly skeletonItems = [
    1,
    2,
    3,
    4,
    5,
    6,
  ];

  private readonly search$ =
    new Subject<string>();

  private readonly subscriptions =
    new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productsService: StoreProductsService,
    private readonly storesService: StoreManagementService,
    private readonly cartService: CartService,
    private readonly userStateService: UserStateService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.paramMap.subscribe(
        (params) => {
          const id =
            params.get('id') ?? '';

          if (
            !id ||
            id === 'create'
          ) {
            this.storeId = '';
            this.loading = false;
            this.error =
              'This store could not be found.';
            this.cdr.markForCheck();

            return;
          }

          if (
            id === this.storeId
          ) {
            return;
          }

          this.storeId = id;

          this.loadStore();
          this.loadProducts();
        }
      )
    );

    this.subscriptions.add(
      this.search$
        .pipe(
          debounceTime(250),
          distinctUntilChanged()
        )
        .subscribe((value) => {
          this.search =
            value.trim().toLowerCase();

          this.applyFilters();
          this.cdr.markForCheck();
        })
    );

    this.subscriptions.add(
      this.cartService.cart$
        .subscribe((cart: any) => {
          this.cartCount =
            cart?.cart?.products?.reduce(
              (
                total: number,
                item: any
              ) =>
                total +
                (item?.quantity ?? 0),
              0
            ) ??
            cart?.items?.reduce(
              (
                total: number,
                item: any
              ) =>
                total +
                (item?.quantity ?? 0),
              0
            ) ??
            0;

          this.cdr.markForCheck();
        })
    );
  }

  private loadStore(): void {
    this.storesService
      .getStore(this.storeId)
      .subscribe({
        next: (response: any) => {
          this.store =
            response?.store ??
            response;

          this.cdr.markForCheck();
        },

        error: () => {
          this.error =
            'Unable to load this store.';

          this.cdr.markForCheck();
        },
      });
  }

  loadProducts(): void {
    if (!this.storeId) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.productsService
      .getStoreProducts(
        this.storeId,
        {
          page: 1,
          limit: 48,
        }
      )
      .subscribe({
        next: (response: any) => {
          this.products = (response?.products ?? []).map((product: Product) => this.toViewProduct(product));

          this.buildCategories();
          this.applyFilters();

          this.loading = false;

          this.cdr.markForCheck();
        },

        error: () => {
          this.products = [];
          this.filteredProducts = [];

          this.loading = false;

          this.error =
            'Unable to load products right now.';

          this.cdr.markForCheck();
        },
      });
  }

  private buildCategories(): void {
    const categoryMap =
      new Map<string, string>();

    for (
      const product of this.products
    ) {
      const category = product.category;

      const value =
        product.categoryId ??
        category?._id;

      const label =
        category?.name ??
        product.categoryId;

      if (
        value &&
        label
      ) {
        categoryMap.set(
          String(value),
          String(label)
        );
      }
    }

    this.categories = [
      {
        value: 'all',
        label: 'All',
      },
      ...Array.from(
        categoryMap,
        ([value, label]) => ({
          value,
          label,
        })
      ),
    ];
  }

  private applyFilters(): void {
    const query =
      this.search;

    let result =
      this.products.filter(
        (product) => {
          const categoryValue = product.categoryId ?? product.category?._id ?? '';

          const categoryMatch =
            this.selectedCategory ===
              'all' ||
            String(categoryValue) ===
              this.selectedCategory;

          const searchable = [
            product.name,
            product.description,
            ...(product.tags ?? []),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          const searchMatch =
            !query ||
            searchable.includes(query);

          const price = Number(product.displayFinalPrice ?? product.finalPrice ?? product.price ?? 0);

          const minMatch =
            this.minPrice == null ||
            price >= this.minPrice;

          const maxMatch =
            this.maxPrice == null ||
            price <= this.maxPrice;

          return (
            categoryMatch &&
            searchMatch &&
            minMatch &&
            maxMatch
          );
        }
      );

    switch (this.sortBy) {
      case 'new':
        result =
          result
            .slice()
            .sort(
              (a, b) =>
                (
                  b.createdAt ?? ''
                ).localeCompare(
                  a.createdAt ?? ''
                )
            );
        break;

      case 'price-asc':
        result =
          result
            .slice()
            .sort(
              (a, b) =>
                Number(a.displayFinalPrice ?? a.finalPrice ?? a.price ?? 0) -
                Number(b.displayFinalPrice ?? b.finalPrice ?? b.price ?? 0)
            );
        break;

      case 'price-desc':
        result =
          result
            .slice()
            .sort(
              (a, b) =>
                Number(b.displayFinalPrice ?? b.finalPrice ?? b.price ?? 0) -
                Number(a.displayFinalPrice ?? a.finalPrice ?? a.price ?? 0)
            );
        break;

      default:
        result =
          result
            .slice()
            .sort(
              (a, b) =>
                (
                  b.soldItems ?? 0
                ) -
                (
                  a.soldItems ?? 0
                )
            );
    }

    this.filteredProducts =
      result;
  }

  onSearch(value: string): void {
    this.search$.next(value);
  }

  clearSearch(): void {
    this.search = '';

    this.search$.next('');

    this.cdr.markForCheck();
  }

  onSortChange(
    value: string
  ): void {
    this.sortBy =
      value as StorefrontComponent[
        'sortBy'
      ];

    this.applyFilters();
  }

  onCategoryChange(
    category: string
  ): void {
    this.selectedCategory =
      category;

    this.applyFilters();

    this.filtersOpen = false;

    this.cdr.markForCheck();
  }

  onPriceChange(): void {
    this.normalizePriceRange();
    this.applyFilters();
  }

  clearFilters(): void {
    this.search = '';

    this.selectedCategory =
      'all';

    this.sortBy =
      'popular';

    this.minPrice = null;
    this.maxPrice = null;

    this.filtersOpen = false;

    this.search$.next('');

    this.applyFilters();

    this.cdr.markForCheck();
  }

  private toViewProduct(product: Product): Product {
    const price = Number(product.price ?? 0);
    const finalPrice = Number(product.finalPrice ?? Math.max(0, price * (1 - Number(product.discount ?? 0) / 100)));
    const image = product.images?.[0];
    const rawImage = typeof image === 'string' ? image : image?.url ?? 'assets/placeholder.png';
    return {
      ...product,
      displayImageUrl: this.optimizeImage(rawImage),
      displayFinalPrice: finalPrice,
      displayOldPrice: finalPrice < price ? price : null,
      displayDiscountPercent: Number(product.discount ?? 0),
    };
  }

  private optimizeImage(url: string): string {
    if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return url;
    if (url.includes('f_auto') || url.includes('q_auto')) return url;
    return url.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_600,c_limit/');
  }

  addToCart(
    product: Product
  ): void {
    if (
      !product?._id ||
      (product.totalItems ?? 0) <= 0 ||
      this.addingProductId ===
        product._id
    ) {
      return;
    }

    if (!getAuthToken()) {
      this.router.navigate(
        ['/login'],
        {
          queryParams: {
            returnUrl:
              this.router.url,
          },
        }
      );

      return;
    }

    this.addingProductId =
      product._id;

    this.error = '';

    this.cdr.markForCheck();

    this.cartService
      .addToCart({
        productId:
          product._id,
        quantity: 1,
      }, product)
      .subscribe({
        next: (response) => {
          this.userStateService.updateCart(response.cart);

          this.addingProductId =
            null;

          this.cdr.markForCheck();
        },

        error: () => {
          this.addingProductId =
            null;

          this.error =
            'Unable to add this product to the cart.';

          this.cdr.markForCheck();
        },
      });
  }

  scrollToProducts(): void {
    const element =
      document.getElementById(
        'products-section'
      );

    element?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  trackByProductId(
    _: number,
    product: Product
  ): string {
    return (
      product._id ??
      product.name
    );
  }

  private normalizePriceRange(): void {
    if (
      this.minPrice != null &&
      this.minPrice < 0
    ) {
      this.minPrice = 0;
    }

    if (
      this.maxPrice != null &&
      this.maxPrice < 0
    ) {
      this.maxPrice = 0;
    }

    if (
      this.minPrice != null &&
      this.maxPrice != null &&
      this.minPrice >
        this.maxPrice
    ) {
      const currentMin =
        this.minPrice;

      this.minPrice =
        this.maxPrice;

      this.maxPrice =
        currentMin;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
