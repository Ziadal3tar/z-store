import { getAuthToken } from 'src/app/core/auth-token.util';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SubCategoriesService {
  private baseUrl = `${environment.apiUrl}/subCategory`;

  constructor(private http: HttpClient) {}
  allSubCategory(): any {
    return this.http.get(`${this.baseUrl}/allSubCategory`, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }

  addSubCategory(data: any, categoryId: any): any {
    return this.http.post(
      `${this.baseUrl}/addSubCategory/${categoryId}`,
      data,
      {
        headers: {
          authorization: `Bearer__${getAuthToken()}`,
        },
      }
    );
  }
  removeSubCategory(id: any): any {
    return this.http.delete(`${this.baseUrl}/removeSubCategory/${id}`, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }
  updateSubCategory(data: any, id: any): any {
    return this.http.put(`${this.baseUrl}/UpdateSubCategory/${id}`, data, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }
}
