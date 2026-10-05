import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Order, OrderStatus } from 'src/app/core/models/order.model';
import { OrderService } from 'src/app/core/services/order.service';

interface OrderView extends Order {
  displayStatusLabel: string;
  displayStatusClass: string;
}

type OrderFilter = 'all' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderHistoryComponent implements OnInit {
  @Input() userData: unknown;
  orders: OrderView[] = [];
  searchTerm = '';
  activeFilter: OrderFilter = 'all';
  currentPage = 1;
  totalPages = 0;
  totalOrders = 0;
  totalValue = 0;
  loading = true;
  error = '';

  constructor(
    private readonly orderService: OrderService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(page = this.currentPage): void {
    this.loading = true;
    this.error = '';
    this.orderService.getMyOrders(page, 10, this.searchTerm.trim(), this.mapStatus(this.activeFilter)).subscribe({
      next: response => {
        this.orders = (response.orders || []).map(order => ({ ...order, displayStatusLabel: this.getStatusLabel(order.status), displayStatusClass: this.getStatusClass(order.status) }));
        this.currentPage = response.page;
        this.totalPages = response.totalPages;
        this.totalOrders = response.total;
        this.totalValue = this.orders.reduce((total, order) => total + Number(order.total || 0), 0);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.orders = [];
        this.error = error.error?.message || 'Could not load your orders.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  setFilter(filter: OrderFilter): void {
    this.activeFilter = filter;
    this.currentPage = 1;
    this.loadOrders(1);
  }

  search(): void { this.currentPage = 1; this.loadOrders(1); }

  resetFilters(): void {
    this.searchTerm = '';
    this.activeFilter = 'all';
    this.currentPage = 1;
    this.loadOrders(1);
  }

  previousPage(): void { if (this.currentPage > 1) this.loadOrders(this.currentPage - 1); }
  nextPage(): void { if (this.currentPage < this.totalPages) this.loadOrders(this.currentPage + 1); }

  viewOrder(order: Order): void { this.router.navigate(['/orders', order._id]); }

  private getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = { pending: 'Pending', confirmed: 'Confirmed', paid: 'Paid', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled', refunded: 'Refunded' };
    return labels[status];
  }

  private getStatusClass(status: OrderStatus): string {
    if (status === 'cancelled' || status === 'refunded') return 'status-canceled';
    if (status === 'delivered') return 'status-completed';
    if (status === 'shipped') return 'status-shipped';
    return 'status-processing';
  }

  trackByOrderId(_: number, order: Order): string { return order._id; }

  private mapStatus(filter: OrderFilter): string | undefined {
    if (filter === 'processing') return 'pending';
    if (filter === 'shipped') return 'shipped';
    if (filter === 'delivered') return 'delivered';
    if (filter === 'cancelled') return 'cancelled';
    return undefined;
  }
}
