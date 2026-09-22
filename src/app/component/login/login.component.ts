import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { setAuthToken } from 'src/app/core/auth-token.util';
import { UserStateService } from 'src/app/core/state/user-state.service';
import { UserService } from './../../services/user.service';

interface LoginErrors {
  emailErr: string;
  passwordErr: string;
  message: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnDestroy {
  email = '';
  password = '';

  loading = false;
  passwordVisible = false;

  errs: LoginErrors = {
    emailErr: '',
    passwordErr: '',
    message: '',
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly userService: UserService,
    private readonly userStateService: UserStateService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  logIn(): void {
    this.clearErrors();

    const email = this.email.trim();
    const password = this.password;

    if (!email) {
      this.errs.emailErr = 'Email is required.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.isValidEmail(email)) {
      this.errs.emailErr = 'Please enter a valid email address.';
      this.cdr.markForCheck();
      return;
    }

    if (!password) {
      this.errs.passwordErr = 'Password is required.';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const data = {
      email,
      password,
    };

    this.userService
      .login(data)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response?.message === 'welcome' && response?.token) {
            setAuthToken(response.token);
            this.userStateService.refresh();

            this.router.navigate(['/home']);
            return;
          }

          this.errs.message =
            response?.message ?? 'Unable to sign in. Please try again.';

          this.cdr.markForCheck();
        },

        error: (err: HttpErrorResponse) => {
          this.handleLoginError(err);
          this.cdr.markForCheck();
        },
      });
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  clearFieldError(field: 'emailErr' | 'passwordErr'): void {
    this.errs[field] = '';
    this.errs.message = '';
  }

  private handleLoginError(err: HttpErrorResponse): void {
    const validation = Array.isArray(err.error?.validationArr)
      ? err.error.validationArr[0]
      : [];

    if (validation.length) {
      for (const element of validation) {
        const message = element?.message;

        if (!message) {
          continue;
        }

        const field = this.extractFieldFromMessage(message);

        if (field === 'email') {
          this.errs.emailErr = message;
        }

        if (field === 'password') {
          this.errs.passwordErr = message;
        }
      }

      return;
    }

    this.errs.message =
      err.error?.message ?? 'Unable to sign in. Please try again.';
  }

  private extractFieldFromMessage(message: string): string {
    const fieldMatch = message.match(/^["']?([a-zA-Z]+)["']?\s/);

    return fieldMatch?.[1]?.toLowerCase() ?? '';
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private clearErrors(): void {
    this.errs = {
      emailErr: '',
      passwordErr: '',
      message: '',
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
