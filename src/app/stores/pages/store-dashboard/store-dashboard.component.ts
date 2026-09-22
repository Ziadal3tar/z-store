
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';

import { ProductsService } from '../../services/products.service';
import { OrdersService } from '../../services/orders.service';
import { StoresService } from '../../services/stores.service';

interface AnalyticsSummary {
  totalRevenue?: number;
  totalOrders?: number;
  totalProducts?: number;
  avgOrderValue?: number;
}

interface DashboardTotals {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
}

@Component({
  selector: 'app-store-dashboard',
  templateUrl: './store-dashboard.component.html',
  styleUrls: ['./store-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreDashboardComponent
  implements OnInit, OnDestroy {

  storeId = '';

  loading = false;
  error = '';

  analytics$!: Observable<AnalyticsSummary | null>;
  recentOrders$!: Observable<any[]>;
  productsSummary$!: Observable<any[]>;

  totals$!: Observable<DashboardTotals>;

  private readonly refresh$ =
    new BehaviorSubject<void>(undefined);

  constructor(
    private readonly storesService: StoresService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    public readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    public readonly route: ActivatedRoute
  ) {
    this.storeId =
      this.route.snapshot.paramMap.get('id') ?? '';
  }

  ngOnInit(): void {
    this.initializeDashboard();
  }

  private initializeDashboard(): void {
    /*
     * shareReplay(1) is important here because the same streams are
     * consumed by both the template and totals$. Without it, the
     * underlying HTTP calls can be executed more than once.
     */

    // this.analytics$ = this.refresh$.pipe(
    //   switchMap(() =>
    //     this.storesService
    //       .getAnalytics(this.storeId)
    //       .pipe(
    //         catchError((err) => {
    //           console.error(
    //             'analytics error',
    //             err
    //           );

    //           this.setError(
    //             'Failed to load store analytics.'
    //           );

    //           return of(null);
    //         })
    //       )
    //   ),
    //   shareReplay(1)
    // );

    this.recentOrders$ = this.refresh$.pipe(
      switchMap(() =>
        this.ordersService
          .getStoreOrders(
            this.storeId,
            {
              page: 1,
              limit: 6,
            }
          )
          .pipe(
            map(
              (response: any) =>
                response?.orders ?? []
            ),
            catchError((err) => {
              console.error(
                'orders error',
                err
              );

              this.setError(
                'Failed to load recent orders.'
              );

              return of([]);
            })
          )
      ),
      shareReplay(1)
    );

    this.productsSummary$ = this.refresh$.pipe(
      switchMap(() =>
        this.productsService
          .getStoreProducts(
            this.storeId,
            {
              page: 1,
              limit: 20,
            }
          )
          .pipe(
            map(
              (response: any) =>
                response?.products ?? []
            ),
            catchError((err) => {
              console.error(
                'products error',
                err
              );

              this.setError(
                'Failed to load store products.'
              );

              return of([]);
            })
          )
      ),
      shareReplay(1)
    );

    this.totals$ = combineLatest([
      this.analytics$,
      this.productsSummary$,
      this.recentOrders$,
    ]).pipe(
      map(
        ([
          analytics,
          products,
          orders,
        ]) => ({
          totalOrders:
            analytics?.totalOrders ??
            orders.length,

          totalRevenue:
            analytics?.totalRevenue ??
            0,

          totalProducts:
            analytics?.totalProducts ??
            products.length,
        })
      ),
      catchError((err) => {
        console.error(
          'totals error',
          err
        );

        return of({
          totalOrders: 0,
          totalRevenue: 0,
          totalProducts: 0,
        });
      }),
      shareReplay(1)
    );

    this.triggerRefresh();
  }

  triggerRefresh(): void {
    this.error = '';

    this.refresh$.next();
    this.cdr.markForCheck();
  }

  goAddProduct(): void {
    this.router.navigate([
      '/store',
      this.storeId,
      'admin',
      'products',
      'new',
    ]);
  }

  goProducts(): void {
    this.router.navigate([
      '/store',
      this.storeId,
      'admin',
      'products',
    ]);
  }

  goOrders(): void {
    this.router.navigate([
      '/store',
      this.storeId,
      'admin',
      'orders',
    ]);
  }

  openStorePublic(): void {
    this.router.navigate([
      '/store',
      this.storeId,
    ]);
  }

  onRemoveProduct(
    productId: string
  ): void {
    if (!productId || this.loading) {
      return;
    }

    const confirmed = window.confirm(
      'Delete this product?'
    );

    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.cdr.markForCheck();

    this.productsService
      .deleteProduct(productId)
      .pipe(
        tap(() => {
          this.triggerRefresh();
        }),
        catchError((err) => {
          console.error(
            'delete product error',
            err
          );

          this.error =
            err?.error?.message ??
            'Failed to delete product.';

          this.cdr.markForCheck();

          return of(null);
        })
      )
      .subscribe({
        complete: () => {
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  openProductEditor(
    productId: string
  ): void {
    if (!this.storeId || !productId) {
      return;
    }

    this.router.navigate([
      '/store',
      this.storeId,
      'admin',
      'products',
      productId,
      'edit',
    ]);
  }

  getStatusClass(
    status?: string
  ): string {
    const normalized =
      status?.toLowerCase() ?? '';

    if (
      normalized.includes('process') ||
      normalized.includes('pending')
    ) {
      return 'processing';
    }

    if (
      normalized.includes('complete') ||
      normalized.includes('delivered')
    ) {
      return 'completed';
    }

    if (
      normalized.includes('cancel') ||
      normalized.includes('reject')
    ) {
      return 'canceled';
    }

    return '';
  }

  trackById(
    index: number,
    item: any
  ): string | number {
    return item?._id ?? index;
  }

  private setError(
    message: string
  ): void {
    /*
     * Avoid replacing a more specific error with another request's
     * fallback error during the same refresh cycle.
     */
    if (!this.error) {
      this.error = message;
    }

    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.refresh$.complete();
  }
}

