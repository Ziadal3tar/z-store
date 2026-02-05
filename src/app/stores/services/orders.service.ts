import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private http: HttpClient) {}
  getStoreOrders(storeId: string, opts: { page?: number, limit?: number } = { page: 1, limit: 10 }) {
  const params = `?page=${opts.page ?? 1}&limit=${opts.limit ?? 10}`;
  return this.http.get(`/api/stores/${storeId}/orders${params}`);
}

}
