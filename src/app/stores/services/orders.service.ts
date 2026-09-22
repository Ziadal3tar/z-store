import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StoreOrderCustomer {
  _id?: string;
  userName?: string;
  email?: string;
}

export interface StoreOrder {
  _id?: string;
  orderNumber?: string;
  user?: StoreOrderCustomer;
  customer?: StoreOrderCustomer;
  items?: Array<{ quantity?: number; product?: { name?: string } }>;
  total?: number;
  subtotal?: number;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt?: string;
}

export interface StoreOrdersResponse {
  orders: StoreOrder[];
  total?: number;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly baseUrl = `${environment.apiUrl}/api/stores`;

  constructor(private readonly http: HttpClient) {}

  getStoreOrders(
    storeId: string,
    opts: { page?: number; limit?: number } = {},
  ): Observable<StoreOrdersResponse> {
    let params = new HttpParams()
      .set('page', String(opts.page ?? 1))
      .set('limit', String(opts.limit ?? 10));

    return this.http.get<StoreOrdersResponse>(
      `${this.baseUrl}/${encodeURIComponent(storeId)}/orders`,
      { params },
    );
  }
}
