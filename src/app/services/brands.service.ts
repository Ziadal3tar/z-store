import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class BrandsService {
  // private baseUrl = 'https://z-store-apis-b6lh.vercel.app/brand';
  private baseUrl = 'https://z-store-apis-b6lh.vercel.app/brand';

  constructor(private http: HttpClient) {}
  allBrands(): any {
    return this.http.get(`${this.baseUrl}/allBrands`, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }

  addBrand(data: any): any {
    return this.http.post(`${this.baseUrl}/addBrand`, data, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
  removeBrand(id: any): any {
    return this.http.delete(`${this.baseUrl}/removeBrand/${id}`, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
  updateBrand(data: any, id: any): any {
    return this.http.put(`${this.baseUrl}/updateBrand/${id}`, data, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
}
