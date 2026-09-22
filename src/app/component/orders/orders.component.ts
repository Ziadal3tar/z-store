
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
type OrderStatus = 'PROCESSING' | 'COMPLETED' | 'CANCELED';
type OrderFilter = 'all' | 'processing' | 'completed' | 'canceled';

interface Order {
  id: string;
  date: string;
  items: number;
  shipping: string;
  payment: string;
  total: number;
  status: OrderStatus;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent implements OnInit {
  @Input() userData: any;

  orders: Order[] = [];
  filteredOrders: Order[] = [];

  searchTerm = '';
  activeFilter: OrderFilter = 'all';

  constructor(
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    /*
     * The original component contains only hard-coded example orders
     * and no API/service method for loading real orders.
     *
     * Keep those examples as typed UI data until the real Orders API
     * is connected.
     */
    this.orders = [
      {
        id: '36637649',
        date: 'June 17, 2018',
        items: 7,
        shipping: 'Pick up from store',
        payment: 'Online by card',
        total: 4896,
        status: 'PROCESSING',
      },
      {
        id: '36637648',
        date: 'June 17, 2018',
        items: 7,
        shipping: 'Pick up from store',
        payment: 'Online by card',
        total: 4896,
        status: 'CANCELED',
      },
      {
        id: '36637647',
        date: 'June 17, 2018',
        items: 7,
        shipping: 'Pick up from store',
        payment: 'Online by card',
        total: 4896,
        status: 'COMPLETED',
      },
    ];

    this.applyFilters();
  }

  setFilter(filter: OrderFilter): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    const query = this.searchTerm.trim().toLowerCase();

    this.filteredOrders = this.orders.filter(
      (order) => {
        const matchesSearch =
          !query ||
          order.id.toLowerCase().includes(query);

        const matchesStatus =
          this.activeFilter === 'all' ||
          order.status.toLowerCase() ===
            this.activeFilter;

        return matchesSearch && matchesStatus;
      }
    );

    this.cdr.markForCheck();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.activeFilter = 'all';
    this.applyFilters();
  }

  get totalValue(): number {
    return this.filteredOrders.reduce(
      (total, order) => total + order.total,
      0
    );
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case 'PROCESSING':
        return 'status-processing';

      case 'COMPLETED':
        return 'status-completed';

      case 'CANCELED':
        return 'status-canceled';

      default:
        return '';
    }
  }

  viewOrder(order: Order): void {
    /*
     * There is currently no order-details route or API in the
     * uploaded Orders component.
     *
     * Keep this method as the extension point for the real
     * order-details implementation.
     */
    console.log('Order selected:', order);
  }

  trackByOrderId(
    _index: number,
    order: Order
  ): string {
    return order.id;
  }
}

