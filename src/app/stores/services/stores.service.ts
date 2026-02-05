import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoresService {
  private baseUrl = 'https://z-store-apis-b6lh.vercel.app/store';

  constructor(private http: HttpClient) {}

  getAnalytics(storeId: string): Observable<any> {
  return this.http.get(`/api/stores/${storeId}/analytics`);
}
 getStore(storeId: any) {
    return this.http.get(`${this.baseUrl}/getStore/${storeId}`, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
}
