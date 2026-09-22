import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, combineLatest, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { OrdersService, StoreOrder } from '../../services/orders.service';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersListComponent implements OnDestroy {
  readonly pageSize = 10;
  readonly page$ = new BehaviorSubject<number>(1);
  readonly refresh$ = new Subject<void>();

  storeId = '';
  total = 0;
  loading = false;
  error = '';

  readonly response$ = combineLatest([
    this.route.paramMap.pipe(map(params => params.get('id') ?? '')),
    this.page$,
    this.refresh$.pipe(startWith(void 0)),
  ]).pipe(
    tap(([storeId]) => {
      this.storeId = storeId;
      this.loading = true;
      this.error = '';
    }),
    switchMap(([storeId, page]) =>
      storeId
        ? this.ordersService.getStoreOrders(storeId, { page, limit: this.pageSize }).pipe(
            catchError(err => {
              console.error('store orders error', err);
              this.error = 'Unable to load orders right now.';
              return of({ orders: [], total: 0, page, limit: this.pageSize });
            }),
          )
        : of({ orders: [], total: 0 }),
    ),
    tap(response => {
      this.total = response.total ?? response.orders.length;
      this.loading = false;
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  constructor(
    private readonly ordersService: OrdersService,
    private readonly route: ActivatedRoute,
  ) {}

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  nextPage(): void {
    if (this.page$.value < this.totalPages) this.page$.next(this.page$.value + 1);
  }

  previousPage(): void {
    if (this.page$.value > 1) this.page$.next(this.page$.value - 1);
  }

  customerName(order: StoreOrder): string {
    return order.user?.userName || order.customer?.userName || order.user?.email || order.customer?.email || 'Customer';
  }

  itemCount(order: StoreOrder): number {
    return (order.items ?? []).reduce((sum, item) => sum + Number(item.quantity ?? 1), 0);
  }

  statusClass(status?: string): string {
    return (status ?? 'pending').toLowerCase().replace(/\s+/g, '-');
  }

  trackById(index: number, order: StoreOrder): string | number {
    return order._id ?? index;
  }

  ngOnDestroy(): void {
    this.page$.complete();
  }
}
