import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class CouponService {
  private baseUrl = `${environment.apiUrl}/coupon`;

  constructor(private http: HttpClient) {}

  addCoupon(data: any): any {
    return this.http.post(`${this.baseUrl}/addCoupon`, data);
  }
  getCoupons(): any {
    return this.http.get(`${this.baseUrl}/allcoupons`);
  }
  getCouponById(id: any) {
    return this.http.get(`${this.baseUrl}/getCouponById/${id}`);
  }
  updateCoupon(data: any) {
    return this.http.put(`${this.baseUrl}/updateCoupon/${data.oldName}`, data);
  }
  stopCoupon(name: any) {
    return this.http.get(`${this.baseUrl}/stopCoupon/${name}`);
  }
  removeCoupon(id: any) {
    return this.http.delete(`${this.baseUrl}/removeCoupon/${id}`);
  }
  getCoupon(name: any): any {
    return this.http.get(`${this.baseUrl}/getCoupon/${name}`);
  }
}
