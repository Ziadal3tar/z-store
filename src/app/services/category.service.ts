import { getAuthToken } from 'src/app/core/auth-token.util';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private baseUrl = `${environment.apiUrl}/category`;
// https://z-store-apis-b6lh.vercel.app
  constructor(private http: HttpClient) {}
  allCategory(): any {
    return this.http.get(`${this.baseUrl}/allCategories`, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }
  addCategory(data: any): any {
    return this.http.post(`${this.baseUrl}/addCategory`, data, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }
  removeCategory(id: any): any {
    return this.http.delete(`${this.baseUrl}/removeCategory/${id}`, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }
  updateCategory(data: any, id: any): any {
    return this.http.put(`${this.baseUrl}/updateCategory/${id}`, data, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }
}
