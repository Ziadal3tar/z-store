import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject, combineLatest, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { Product, PagedProductsResponse } from '../../services/products.service';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent implements OnDestroy {
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly pageSize = 8;

  readonly loading$ = new BehaviorSubject<boolean>(false);
  readonly error$ = new BehaviorSubject<string>('');
  readonly page$ = new BehaviorSubject<number>(1);
  readonly refresh$ = new Subject<void>();

  storeId = '';
  total = 0;

  private readonly destroy$ = new Subject<void>();

  readonly response$ = combineLatest([
    this.route.paramMap.pipe(
      tap(params => {
        this.storeId = params.get('id') ?? '';
      }),
      map(params => params.get('id') ?? ''),
    ),
    this.searchControl.valueChanges.pipe(
      startWith(this.searchControl.value),
      debounceTime(250),
      distinctUntilChanged(),
      tap(() => this.page$.next(1)),
    ),
    this.page$,
    this.refresh$.pipe(startWith(void 0)),
  ]).pipe(
    tap(() => {
      this.loading$.next(true);
      this.error$.next('');
    }),
    switchMap(([storeId, query, page]) =>
      storeId
        ? this.productsService
            .getStoreProducts(storeId, {
              page,
              limit: this.pageSize,
              q: query.trim() || undefined,
            })
            .pipe(
              catchError(err => {
                console.error('store products error', err);
                this.error$.next('Unable to load products right now.');
                return of({ products: [], total: 0, page, limit: this.pageSize } as PagedProductsResponse);
              }),
            )
        : of({ products: [], total: 0, page: 1, limit: this.pageSize } as PagedProductsResponse),
    ),
    tap(response => {
      this.total = response.total ?? response.products.length;
      this.loading$.next(false);
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  constructor(
    private readonly productsService: ProductsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  nextPage(): void {
    if (this.page$.value < this.totalPages) {
      this.page$.next(this.page$.value + 1);
    }
  }

  previousPage(): void {
    if (this.page$.value > 1) {
      this.page$.next(this.page$.value - 1);
    }
  }

  editProduct(productId?: string): void {
    if (!productId || !this.storeId) return;
    this.router.navigate(['/store', this.storeId, 'admin', 'products', productId, 'edit']);
  }

  addProduct(): void {
    if (!this.storeId) return;
    this.router.navigate(['/store', this.storeId, 'admin', 'products', 'new']);
  }

  deleteProduct(product: Product): void {
    if (!product._id || !this.storeId) return;

    const confirmed = window.confirm(`Delete “${product.name}”? This action cannot be undone.`);
    if (!confirmed) return;

    this.loading$.next(true);
    this.productsService.deleteProduct(product._id).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: () => this.refresh$.next(),
      error: err => {
        console.error('delete product error', err);
        this.error$.next(err?.error?.message ?? 'Unable to delete the product.');
        this.loading$.next(false);
      },
    });
  }

  trackById(index: number, item: Product): string | number {
    return item._id ?? index;
  }

  productImage(product: Product): string {
    const image = product.images?.[0];
    if (typeof image === 'string') return image;
    if (image?.url) return image.url;
    return 'assets/images/product-placeholder.png';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.loading$.complete();
    this.error$.complete();
    this.page$.complete();
  }
}
