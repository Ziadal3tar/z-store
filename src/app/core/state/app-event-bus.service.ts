import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppEventBusService {
  private readonly eventSubject = new Subject<any>();

  readonly events$ = this.eventSubject.asObservable();

  emit(event: any): void {
    this.eventSubject.next(event);
  }

  emitEmpty(): void {
    this.eventSubject.next({});
  }

  emitProductUpdated(productId: any): void {
    this.eventSubject.next(productId);
  }

  events(): Observable<any> {
    return this.events$;
  }
}
