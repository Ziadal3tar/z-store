import { HttpClient } from '@angular/common/http';
import { observable, Observable, Subscriber } from 'rxjs';
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // private baseUrl = 'https://z-store-apis-b6lh.vercel.app/chat';
  private baseUrl = 'https://z-store-apis-b6lh.vercel.app/chat';

  constructor(private http: HttpClient) {}

  sendMessage(data: any) {
    return this.http.post(`${this.baseUrl}/sendMessage`, data);
  }
  getChat(id: any) {
    return this.http.get(`${this.baseUrl}/getChat/${id}`);
  }
  getMessage(id: any) {
    return this.http.get(`${this.baseUrl}/getMessage/${id}`);
  }
}
