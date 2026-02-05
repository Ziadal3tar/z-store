import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { ProductsService } from '../../services/products.service';
import { OrdersService } from '../../services/orders.service';
import { Observable, BehaviorSubject, combineLatest, Subscription, of } from 'rxjs';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { StoresService } from '../../services/stores.service';

@Component({
  selector: 'app-store-dashboard',
  templateUrl: './store-dashboard.component.html',
  styleUrls: ['./store-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreDashboardComponent implements OnInit, OnDestroy {
  storeId!: string | any;

  private refresh$ = new BehaviorSubject<void>(undefined);
  loading = false;
  error = '';

  analytics$!: Observable<any>;
  recentOrders$!: Observable<any[]>;
  productsSummary$!: Observable<any[]>;
  totals$!: Observable<{ totalOrders: number; totalRevenue: number; totalProducts: number }>;

  private subs: Subscription[] = [];

  constructor(
    private storesSvc: StoresService,
    private productsSvc: ProductsService,
    private ordersSvc: OrdersService,
    public router: Router,
    private cdr: ChangeDetectorRef,
    public route: ActivatedRoute,
  ) {
    this.storeId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    // analytics
    this.analytics$ = this.refresh$.pipe(
      switchMap(() =>
        this.storesSvc.getAnalytics(this.storeId).pipe(
          catchError(err => {
            console.error('analytics error', err);
            this.error = 'Failed to load analytics';
            this.cdr.markForCheck();
            return of(null);
          })
        )
      )
    );

    // recent orders (paginated)
    this.recentOrders$ = this.refresh$.pipe(
      switchMap(() =>
        this.ordersSvc.getStoreOrders(this.storeId, { page: 1, limit: 6 }).pipe(
          map((res: any) => res?.orders ?? []),
          catchError(err => {
            console.error('orders error', err);
            this.error = 'Failed to load orders';
            this.cdr.markForCheck();
            return of([]);
          })
        )
      )
    );

    // products summary
    this.productsSummary$ = this.refresh$.pipe(
      switchMap(() =>
        this.productsSvc.getStoreProducts(this.storeId, { page: 1, limit: 20 }).pipe(
          map((res: any) => res?.products ?? []),
          catchError(err => {
            console.error('products error', err);
            this.error = 'Failed to load products';
            this.cdr.markForCheck();
            return of([]);
          })
        )
      )
    );

    // totals aggregation
    this.totals$ = combineLatest([this.analytics$, this.productsSummary$, this.recentOrders$]).pipe(
      map(([analytics, products, orders]) => {
        const totalRevenue = analytics?.totalRevenue ?? 0;
        const totalOrders = analytics?.totalOrders ?? (orders?.length ?? 0);
        const totalProducts = products?.length ?? 0;
        return { totalOrders, totalRevenue, totalProducts };
      }),
      catchError(err => {
        console.error('totals error', err);
        return of({ totalOrders: 0, totalRevenue: 0, totalProducts: 0 });
      })
    );

    // initial load
    this.triggerRefresh();
  }

  triggerRefresh(): void {
    this.error = '';
    this.refresh$.next();
  }

  goAddProduct(): void {
    // نوّهت: استخدمنا /store/:id/admin/products/new في مكان آخر؛ حافظ على نفس النمط
    this.router.navigate(['/store', this.storeId, 'admin', 'products', 'new']);
  }

  openStorePublic(): void {
    // توحيد المسار: /store/:id
    this.router.navigate(['/store', this.storeId]);
  }

  onRemoveProduct(productId: string, products: any[]): void {
    if (!confirm('Delete this product?')) return;
    if (this.loading) return;

    this.loading = true;
    this.cdr.markForCheck();

    // *** لاحظ: ProductsService.deleteProduct(productId) يتوقع productId فقط في النسخة المحدثة ***
    const sub = this.productsSvc.deleteProduct(productId).pipe(
      tap((res: any) => {
        // reload after successful delete
        this.triggerRefresh();
      }),
      catchError(err => {
        console.error('delete product error', err);
        alert(err?.error?.message ?? 'Failed to delete product');
        return of(null);
      })
    ).subscribe({
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    this.subs.push(sub);
  }

  trackById(index: number, item: any) {
    return item?._id ?? index;
  }

  openProductEditor(productId: string): void {
    if (!this.storeId) {
      console.warn('no storeId found');
      return;
    }
    // توحيد المسار إلى /store/:id/admin/products/:productId/edit
    this.router.navigate(['/store', this.storeId, 'admin', 'products', productId, 'edit']);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
