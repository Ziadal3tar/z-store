import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  // private baseUrl = 'https://z-store-apis-b6lh.vercel.app/category';
  private baseUrl = 'https://z-store-apis-b6lh.vercel.app/category';
// https://z-store-apis-b6lh.vercel.app
  constructor(private http: HttpClient) {}
  allCategory(): any {
    return this.http.get(`${this.baseUrl}/allCategories`, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
  addCategory(data: any): any {
    return this.http.post(`${this.baseUrl}/addCategory`, data, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
  removeCategory(id: any): any {
    return this.http.delete(`${this.baseUrl}/removeCategory/${id}`, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
  updateCategory(data: any, id: any): any {
    return this.http.put(`${this.baseUrl}/updateCategory/${id}`, data, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
}
