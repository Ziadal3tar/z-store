import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface NewsletterResponse {
  message: string;
  subscriber?: { _id: string; email: string; active: boolean; subscribedAt: string };
}

@Injectable({ providedIn: 'root' })
export class NewsletterService {
  private readonly baseUrl = `${environment.apiUrl}/newsletter`;

  constructor(private readonly http: HttpClient) {}

  subscribe(email: string): Observable<NewsletterResponse> {
    return this.http.post<NewsletterResponse>(`${this.baseUrl}/subscribe`, { email });
  }
}
