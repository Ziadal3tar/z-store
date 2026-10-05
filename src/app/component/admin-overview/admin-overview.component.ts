import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import {
  AdminAnalyticsService,
  AdminSummaryResponse,
} from 'src/app/core/services/admin-analytics.service';

interface SalesPoint {
  label: string;
  revenue: number;
  orders: number;
  height: number;
}

@Component({
  selector: 'app-admin-overview',
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOverviewComponent implements OnInit {
  data?: AdminSummaryResponse;
  salesChart: SalesPoint[] = [];
  loading = true;
  error = '';
  lastUpdated = new Date();

  constructor(
    private readonly analytics: AdminAnalyticsService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(force = false): void {
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();

    this.analytics.getSummary(force).subscribe({
      next: (data) => {
        this.data = data;
        this.lastUpdated = new Date();
        this.prepareViewModel(data);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.error = error?.error?.message || 'Could not load the admin overview.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  trackByStatus(_: number, item: { _id: string; count: number }): string {
    return item._id;
  }

  trackByOrder(_: number, order: { _id: string }): string {
    return order._id;
  }

  trackByProduct(_: number, product: { _id: string }): string {
    return product._id;
  }

  trackByCategory(_: number, category: { _id: string }): string {
    return category._id;
  }


  private prepareViewModel(data: AdminSummaryResponse): void {
    const maxRevenue = Math.max(
      1,
      ...(data.salesByDay ?? []).map((item) => Number(item.revenue) || 0),
    );

    this.salesChart = (data.salesByDay ?? []).map((item) => ({
      label: item.label,
      revenue: Number(item.revenue) || 0,
      orders: Number(item.orders) || 0,
      height: Math.max(7, Math.round(((Number(item.revenue) || 0) / maxRevenue) * 100)),
    }));

    const maxStatusCount = Math.max(
      1,
      ...(data.statusBreakdown ?? []).map((item) => Number(item.count) || 0),
    );

    data.statusBreakdown = (data.statusBreakdown ?? []).map((item) => ({
      ...item,
      width: Math.max(8, Math.round(((Number(item.count) || 0) / maxStatusCount) * 100)),
    })) as AdminSummaryResponse['statusBreakdown'];

    const maxCategorySold = Math.max(
      1,
      ...(data.topCategories ?? []).map((item) => Number(item.sold) || 0),
    );

    data.topCategories = (data.topCategories ?? []).map((item) => ({
      ...item,
      width: Math.max(8, Math.round(((Number(item.sold) || 0) / maxCategorySold) * 100)),
    })) as AdminSummaryResponse['topCategories'];
  }
}
