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
    return this.http.post(`${this.baseUrl}/addStore`, formdata);
  }
  getStore(storeId: any) {
    return this.http.get(`${this.baseUrl}/getStore/${storeId}`);
  }
  searchStore(data: any) {
    return this.http.post(`${this.baseUrl}/searchStores`, data);
  }
  deleteStore(id: string) {
    return this.http.delete(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }
  editStoreImg(formdata: any) {
    return this.http.put(`${this.baseUrl}/editStoreImg`, formdata);
  }
}
