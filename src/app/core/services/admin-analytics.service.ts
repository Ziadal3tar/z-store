import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AdminSummaryResponse {
  summary: {
    customers: number;
    products: number;
    orders: number;
    revenue: number;
    abandonedCarts: number;
    averageOrderValue: number;
    newCustomers: number;
    lowStockProducts: number;
    activeCoupons: number;
  };
  statusBreakdown: Array<{ _id: string; count: number; width?: number }>;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    userId?: { userName?: string; email?: string };
    total: number;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    finalPrice: number;
    ratingAverage?: number;
    soldItems?: number;
    stock?: number;
    images?: string[];
  }>;
  salesByDay: Array<{
    date: string;
    label: string;
    revenue: number;
    orders: number;
  }>;
  topCategories: Array<{
    _id: string;
    name?: string;
    sold: number;
    revenue: number;
    width?: number;
  }>;
}

@Injectable({ providedIn: 'root' })
export class AdminAnalyticsService {
  private readonly url = `${environment.apiUrl}/order/admin/summary`;
  private cache$?: Observable<AdminSummaryResponse>;

  constructor(private readonly http: HttpClient) {}

  getSummary(force = false): Observable<AdminSummaryResponse> {
    if (!force && this.cache$) {
      return this.cache$;
    }

    const query = force ? '?refresh=1' : '';
    this.cache$ = this.http
      .get<AdminSummaryResponse>(`${this.url}${query}`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));

    return this.cache$;
  }
}
