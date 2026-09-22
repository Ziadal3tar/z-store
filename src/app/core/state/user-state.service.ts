import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { clearAuthToken, getAuthToken } from 'src/app/core/auth-token.util';
import { User } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private readonly userSubject = new BehaviorSubject<User | undefined>(undefined);

  readonly user$ = this.userSubject.asObservable();

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
  ) {}

  get snapshot(): User | undefined {
    return this.userSubject.value;
  }

  setUserData(user: User | null | undefined): void {
    this.userSubject.next(user ?? undefined);
  }

  refresh(): void {
    const token = getAuthToken();

    if (!token) {
      this.clear();
      return;
    }

    this.userService.getUserData(token).subscribe({
      next: (response: any) => {
        this.setUserData(response.user ?? response.userData);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 401) {
          clearAuthToken();
          this.clear();
          this.router.navigate(['/login']);
        }
      },
    });
  }

  clear(): void {
    this.userSubject.next(undefined);
  }

  deleteFromFavorites(productId: string): void {
    const token = getAuthToken();

    if (!token || !productId) {
      return;
    }

    this.userService.deleteFromFavorites(token, { productId }).subscribe({
      next: () => this.refresh(),
    });
  }
}
