import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StoresService {
  private readonly baseUrl = `${environment.apiUrl}/store`;

  constructor(private readonly http: HttpClient) {}

  getAnalytics(storeId: string): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/${encodeURIComponent(storeId)}/analytics`);
  }

  getStore(storeId: string): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/getStore/${encodeURIComponent(storeId)}`);
  }
}
