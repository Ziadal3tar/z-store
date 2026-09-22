import { getAuthToken } from 'src/app/core/auth-token.util';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class BrandsService {
  private baseUrl = `${environment.apiUrl}/brand`;

  constructor(private http: HttpClient) {}
  allBrands(): any {
    return this.http.get(`${this.baseUrl}/allBrands`, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }

  addBrand(data: any): any {
    return this.http.post(`${this.baseUrl}/addBrand`, data, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }
  removeBrand(id: any): any {
    return this.http.delete(`${this.baseUrl}/removeBrand/${id}`, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }
  updateBrand(data: any, id: any): any {
    return this.http.put(`${this.baseUrl}/updateBrand/${id}`, data, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }
}
