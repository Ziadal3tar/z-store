import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class StoresService {
  // private baseUrl = 'https://z-store-apis-b6lh.vercel.app/store';
  private baseUrl = 'https://z-store-apis-b6lh.vercel.app/store';

  constructor(private http: HttpClient) {}
  addStores(formdata: any): any {
    return this.http.post(`${this.baseUrl}/addStore`, formdata, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
  getStore(storeId: any) {
    return this.http.get(`${this.baseUrl}/getStore/${storeId}`, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
  deleteStore(createdBy: any) {
    return this.http.get(`${this.baseUrl}/deleteStore/${createdBy}`);
  }
  searchStore(data: any) {
    return this.http.post(`${this.baseUrl}/searchStores`, data, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
  storDeleted(id: any) {
    return this.http.post(`${this.baseUrl}/storDeleted`, id);
  }
  removeStore(id: any) {
    return this.http.delete(`${this.baseUrl}/removeStore/${id}`);
  }
  editStoreImg(formdata: any) {
    return this.http.put(`${this.baseUrl}/editStoreImg`, formdata, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
}
