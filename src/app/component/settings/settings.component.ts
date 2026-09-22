
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { clearAuthToken } from 'src/app/core/auth-token.util';
import { UserStateService } from 'src/app/core/state/user-state.service';
import { UserService } from 'src/app/services/user.service';

interface NotificationPreferences {
  weeklyNewsletter: boolean;
  newProducts: boolean;
  productSpecials: boolean;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnDestroy {
  @Input() settings: any;
  @Input() userData: any;

  newEmail = '';

  oldPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  passwordErr = '';
  confirmPassErr = '';
  emailErr = '';

  emailLoading = false;
  passwordLoading = false;

  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  notifications: NotificationPreferences = {
    weeklyNewsletter: false,
    newProducts: false,
    productSpecials: false,
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly userStateService: UserStateService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  updateEmail(): void {
    this.emailErr = '';

    const email = this.newEmail.trim();

    if (!email) {
      this.emailErr = 'Please enter a new email address.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.isValidEmail(email)) {
      this.emailErr = 'Please enter a valid email address.';
      this.cdr.markForCheck();
      return;
    }

    if (
      this.userData?.email &&
      email.toLowerCase() === this.userData.email.toLowerCase()
    ) {
      this.emailErr = 'The new email must be different from your current email.';
      this.cdr.markForCheck();
      return;
    }

    const data = {
      email,
      type: 'email',
    };

    this.emailLoading = true;
    this.cdr.markForCheck();

    this.userService
      .updateUser(data, this.userData._id)
      .pipe(
        finalize(() => {
          this.emailLoading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response?.message === 'email is updated') {
            clearAuthToken();
            this.userStateService.clear();
            this.router.navigate(['/login']);
            return;
          }

          this.emailErr =
            response?.message ??
            'Unable to update your email address.';

          this.cdr.markForCheck();
        },

        error: (err: HttpErrorResponse) => {
          this.emailErr =
            err.error?.message ??
            'Unable to update your email address.';

          this.cdr.markForCheck();
        },
      });
  }

  updatePassword(): void {
    this.passwordErr = '';
    this.confirmPassErr = '';

    if (!this.oldPassword) {
      this.passwordErr = 'Please enter your current password.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.newPassword) {
      this.passwordErr = 'Please enter a new password.';
      this.cdr.markForCheck();
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordErr =
        'New password must be at least 6 characters.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.confirmNewPassword) {
      this.confirmPassErr = 'Please confirm your new password.';
      this.cdr.markForCheck();
      return;
    }

    if (this.confirmNewPassword !== this.newPassword) {
      this.confirmPassErr =
        'Confirm password must be the same as the new password.';
      this.cdr.markForCheck();
      return;
    }

    const data = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
      confirmNewPassword: this.confirmNewPassword,
      type: 'password',
    };

    this.passwordLoading = true;
    this.cdr.markForCheck();

    this.userService
      .updateUser(data, this.userData._id)
      .pipe(
        finalize(() => {
          this.passwordLoading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response?.message === 'password is updated') {
            clearAuthToken();
            this.userStateService.clear();
            this.router.navigate(['/login']);
            return;
          }

          this.passwordErr =
            response?.message ??
            'Unable to update your password.';

          this.cdr.markForCheck();
        },

        error: (err: HttpErrorResponse) => {
          this.passwordErr =
            err.error?.message ??
            'Unable to update your password.';

          this.confirmPassErr = '';
          this.cdr.markForCheck();
        },
      });
  }

  logOut(): void {
    clearAuthToken();
    this.userStateService.clear();
    this.router.navigate(['/login']);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

