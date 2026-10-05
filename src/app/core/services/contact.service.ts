import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly endpoint = `${environment.apiUrl}/contact/send`;

  constructor(private readonly http: HttpClient) {}

  sendMessage(payload: ContactMessagePayload): Observable<ContactMessageResponse> {
    return this.http.post<ContactMessageResponse>(this.endpoint, payload);
  }
}
