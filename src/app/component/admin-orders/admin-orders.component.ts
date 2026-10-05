import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { OrderStatus } from 'src/app/core/models/order.model';
import { AdminOrder, OrderService } from 'src/app/core/services/order.service';

const STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  readonly statuses = STATUSES;
  orders: AdminOrder[] = [];
  search = '';
  status = '';
  currentPage = 1;
  pageSize = 12;
  totalPages = 0;
  total = 0;
  loading = true;
  updatingId = '';
  error = '';

  private readonly search$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly orderService: OrderService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(value => {
        this.search = value.trim();
        this.currentPage = 1;
        this.load();
      });

    this.load();
  }

  ngOnDestroy(): void {
    this.search$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(value: string): void {
    this.search$.next(value);
  }

  onStatus(value: string): void {
    this.status = value;
    this.currentPage = 1;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();

    this.orderService.getAdminOrders(this.currentPage, this.pageSize, this.search, this.status).subscribe({
      next: response => {
        this.orders = response.orders ?? [];
        this.total = response.total ?? 0;
        this.totalPages = response.totalPages ?? 0;
        this.currentPage = response.page ?? this.currentPage;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.error = error.error?.message || 'Could not load orders.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  updateStatus(order: AdminOrder, status: any): void {
    if (!order._id || order.status === status || this.updatingId) return;

    this.updatingId = order._id;
    this.error = '';
    this.cdr.markForCheck();

    this.orderService.updateStatus(order._id, status).subscribe({
      next: response => {
        const updated = response.order;
        this.orders = this.orders.map(item =>
          item._id === updated._id
            ? { ...item, ...updated, userId: item.userId }
            : item,
        );
        this.updatingId = '';
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.error = error.error?.message || 'Could not update the order.';
        this.updatingId = '';
        this.cdr.markForCheck();
      },
    });
  }

  trackByOrder(_: number, order: AdminOrder): string | undefined {
    return order._id;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.load();
  }
}
