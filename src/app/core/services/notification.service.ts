import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, shareReplay, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NotificationItem } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly baseUrl = `${environment.apiUrl}/notification`;
  private readonly unreadSubject = new BehaviorSubject<number>(0);
  readonly unread$ = this.unreadSubject.asObservable();
  private latestRequest?: Observable<{ notifications: NotificationItem[]; unread: number }>;

  constructor(private readonly http: HttpClient) {}

  listMine(force = false): Observable<{ notifications: NotificationItem[]; unread: number }> {
    if (!force && this.latestRequest) return this.latestRequest;
    this.latestRequest = this.http.get<{ notifications: NotificationItem[]; unread: number }>(`${this.baseUrl}/me`).pipe(
      tap(response => this.unreadSubject.next(response.unread ?? 0)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.latestRequest;
  }

  markRead(id: string): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/${encodeURIComponent(id)}/read`, {}).pipe(tap(() => (this.latestRequest = undefined)));
  }

  markAllRead(): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/read-all`, {}).pipe(tap(() => {
      this.unreadSubject.next(0);
      this.latestRequest = undefined;
    }));
  }
}
