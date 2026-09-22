import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { StoresService } from 'src/app/services/stores.service';

@Injectable({
  providedIn: 'root',
})
export class StoreStateService {
  private readonly storeSubject = new BehaviorSubject<any | undefined>(
    undefined
  );

  readonly store$ = this.storeSubject.asObservable();

  constructor(
    private readonly storesService: StoresService
  ) {}

  get snapshot(): any | undefined {
    return this.storeSubject.value;
  }

  refresh(storeId: string): void {
    if (!storeId) {
      this.storeSubject.next(undefined);
      return;
    }

    this.storesService.getStore(storeId).subscribe({
      next: (response: any) => {
        this.storeSubject.next(
          response?.store ?? response ?? undefined
        );
      },
    });
  }

  clear(): void {
    this.storeSubject.next(undefined);
  }
}
