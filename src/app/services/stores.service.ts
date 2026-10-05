import { getAuthToken } from 'src/app/core/auth-token.util';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class StoresService {
  private baseUrl = `${environment.apiUrl}/store`;

  constructor(private http: HttpClient) {}
  addStores(formdata: any): any {
    return this.http.post(`${this.baseUrl}/addStore`, formdata, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }
  getStore(storeId: any) {
    return this.http.get(`${this.baseUrl}/getStore/${storeId}`, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }
  deleteStore(createdBy: any) {
    return this.http.delete(`${this.baseUrl}/${createdBy}`, { headers: { authorization: `Bearer__${getAuthToken()}` } });
  }
  searchStore(data: any) {
    return this.http.post(`${this.baseUrl}/searchStores`, data, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }
  storDeleted(id: any) {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: { authorization: `Bearer__${getAuthToken()}` } });
  }
  removeStore(id: any) {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: { authorization: `Bearer__${getAuthToken()}` } });
  }
  editStoreImg(formdata: any) {
    return this.http.put(`${this.baseUrl}/editStoreImg`, formdata, {
      headers: {
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }
}
