import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SubCategoriesService {
  // private baseUrl = 'https://z-store-apis-b6lh.vercel.app/subCategory';
  private baseUrl ='https://z-store-apis-b6lh.vercel.app/subCategory';

  constructor(private http: HttpClient) {}
  allSubCategory(): any {
    return this.http.get(`${this.baseUrl}/allSubCategory`, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }

  addSubCategory(data: any, categoryId: any): any {
    return this.http.post(
      `${this.baseUrl}/addSubCategory/${categoryId}`,
      data,
      {
        headers: {
          authorization: `Bearer__${localStorage.getItem('userToken')}`,
        },
      }
    );
  }
  removeSubCategory(id: any): any {
    return this.http.delete(`${this.baseUrl}/removeSubCategory/${id}`, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
  updateSubCategory(data: any, id: any): any {
    return this.http.put(`${this.baseUrl}/UpdateSubCategory/${id}`, data, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
}
