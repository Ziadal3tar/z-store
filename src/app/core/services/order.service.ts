import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Order, OrderStatus } from '../models/order.model';

export interface AdminOrder extends Omit<Order, 'userId'> {
  userId: {
    _id: string;
    userName?: string;
    email?: string;
    phone?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly baseUrl = `${environment.apiUrl}/order`;
  private mineCache?: Observable<{ orders: Order[]; total: number; page: number; limit: number; totalPages: number }>;

  constructor(private readonly http: HttpClient) {}

  createOrder(payload: unknown): Observable<{ order: Order }> {
    return this.http.post<{ order: Order }>(this.baseUrl, payload).pipe(tap(() => (this.mineCache = undefined)));
  }

  getMyOrders(page = 1, limit = 10, search = '', status?: string): Observable<{ orders: Order[]; total: number; page: number; limit: number; totalPages: number }> {
    const key = `${page}:${limit}:${search.trim().toLowerCase()}:${status ?? ''}`;
    if (page === 1 && limit === 10 && !search && !status && this.mineCache) return this.mineCache;
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search.trim()) params = params.set('search', search.trim());
    if (status) params = params.set('status', status);
    const request$ = this.http.get<{ orders: Order[]; total: number; page: number; limit: number; totalPages: number }>(`${this.baseUrl}/me`, { params }).pipe(
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    if (key === '1:10::') this.mineCache = request$;
    return request$;
  }

  getOrder(id: string): Observable<{ order: Order }> {
    return this.http.get<{ order: Order }>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }


  getAdminOrders(page = 1, limit = 12, search = '', status = ''): Observable<{ orders: AdminOrder[]; total: number; page: number; limit: number; totalPages: number }> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search.trim()) params = params.set('search', search.trim());
    if (status) params = params.set('status', status);
    return this.http.get<{ orders: AdminOrder[]; total: number; page: number; limit: number; totalPages: number }>(`${this.baseUrl}/admin`, { params });
  }

  updateStatus(id: string, status: OrderStatus): Observable<{ order: Order }> {
    return this.http.patch<{ order: Order }>(`${this.baseUrl}/${encodeURIComponent(id)}/status`, { status }).pipe(
      tap(() => (this.mineCache = undefined)),
    );
  }

  cancelOrder(id: string): Observable<{ order: Order }> {
    return this.http.patch<{ order: Order }>(`${this.baseUrl}/${encodeURIComponent(id)}/cancel`, {}).pipe(tap(() => (this.mineCache = undefined)));
  }
}
