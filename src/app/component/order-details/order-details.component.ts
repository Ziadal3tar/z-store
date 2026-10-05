import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Order, OrderStatus } from 'src/app/core/models/order.model';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  order?: Order;
  loading = true;
  error = '';
  cancelling = false;
  canCancelOrder = false;
  readonly stepState: Record<OrderStatus, { done: boolean; current: boolean }> = {
    pending: { done: false, current: false },
    confirmed: { done: false, current: false },
    shipped: { done: false, current: false },
    delivered: { done: false, current: false },
    cancelled: { done: false, current: false },
    refunded: { done: false, current: false },
    paid: {
  done: false,
  current: false
},
  };
  private readonly destroy$ = new Subject<void>();
  readonly steps: Array<{ status: OrderStatus; label: string }> = [
    { status: 'pending', label: 'Order placed' },
    { status: 'confirmed', label: 'Confirmed' },
    { status: 'shipped', label: 'Shipped' },
    { status: 'delivered', label: 'Delivered' },
  ];

  constructor(private readonly route: ActivatedRoute, private readonly orderService: OrderService, private readonly router: Router, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'Order not found.'; this.loading = false; this.cdr.markForCheck(); return; }
    this.orderService.getOrder(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => { this.order = response.order; this.updateOrderViewState(); this.loading = false; this.cdr.markForCheck(); },
      error: (error: HttpErrorResponse) => { this.error = error.error?.message || 'Could not load this order.'; this.loading = false; this.cdr.markForCheck(); },
    });
  }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
  private updateOrderViewState(): void {
    const status = this.order?.status;
    this.canCancelOrder = status === 'pending' || status === 'confirmed';

    (Object.keys(this.stepState) as OrderStatus[]).forEach(key => {
      this.stepState[key] = { done: false, current: key === status };
    });

    if (!status || ['cancelled', 'refunded'].includes(status)) return;
    const currentIndex = this.steps.findIndex(step => step.status === status);
    this.steps.forEach((step, index) => {
      this.stepState[step.status] = { done: currentIndex >= index, current: step.status === status };
    });
  }
  cancelOrder(): void { if (!this.order || !this.canCancelOrder || this.cancelling) return; this.cancelling = true; this.orderService.cancelOrder(this.order._id).subscribe({ next: response => { this.order = response.order; this.updateOrderViewState(); this.cancelling = false; this.cdr.markForCheck(); }, error: (error: HttpErrorResponse) => { this.error = error.error?.message || 'The order could not be cancelled.'; this.cancelling = false; this.cdr.markForCheck(); } }); }
  back(): void { this.router.navigate(['/account/orders'], { queryParams: { section: 'orders' } }); }
  trackByItem(index: number, item: { productId: string }): string | number { return item.productId || index; }
}
