import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class CouponService {
  // private baseUrl = 'https://z-store-apis-b6lh.vercel.app/coupon';
  private baseUrl = 'https://z-store-apis-b6lh.vercel.app/coupon';

  constructor(private http: HttpClient) {}

  addCoupon(data: any): any {
    return this.http.post(`${this.baseUrl}/addCoupon`, data, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
  getCoupons(): any {
    return this.http.get(`${this.baseUrl}/allcoupons`);
  }
  getCouponById(id: any) {
    return this.http.get(`${this.baseUrl}/getCouponById/${id}`);
  }
  updateCoupon(data: any) {
    return this.http.put(`${this.baseUrl}/updateCoupon/${data.oldName}`, data, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
  stopCoupon(name: any) {
    return this.http.get(`${this.baseUrl}/stopCoupon/${name}`, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
  removeCoupon(id: any) {
    return this.http.delete(`${this.baseUrl}/removeCoupon/${id}`, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
  getCoupon(name: any): any {
    return this.http.get(`${this.baseUrl}/getCoupon/${name}`);
  }
}
