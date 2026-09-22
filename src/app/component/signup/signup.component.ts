import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { UserService } from '../../services/user.service';

interface SignupErrors {
  userNameErr: string;
  emailErr: string;
  passwordErr: string;
  confirmPasswordErr: string;
  message: string;
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent implements OnDestroy {
  userName = '';
  email = '';
  password = '';
  confirmPassword = '';

  loading = false;

  showPassword = false;
  showConfirmPassword = false;

  errs: SignupErrors = {
    userNameErr: '',
    emailErr: '',
    passwordErr: '',
    confirmPasswordErr: '',
    message: '',
  };

  private readonly destroy$ =
    new Subject<void>();

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  signUp(): void {
    if (this.loading) {
      return;
    }


    this.clearErrors();

    const data = {
      userName: this.userName.trim(),
      email: this.email.trim(),
      password: this.password,
      confirmPassword:
        this.confirmPassword,
    };

    if (!this.validateForm(data)) {
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.userService
      .signUp(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (
            response?.message ===
            'added successfully'
          ) {
            this.router.navigate([
              '/login',
            ]);

            return;
          }

          this.loading = false;
          this.cdr.markForCheck();
        },

        error: (err: HttpErrorResponse) => {
          this.loading = false;

          this.handleServerError(err);

          this.cdr.markForCheck();
        },
      });


  }

  clearFieldError(
    field: keyof Omit<
      SignupErrors,
      'message'
    >
  ): void {
    this.errs[field] = '';
  }

  clearGeneralError(): void {
    this.errs.message = '';
    this.cdr.markForCheck();
  }

  private clearErrors(): void {
    this.errs = {
      userNameErr: '',
      emailErr: '',
      passwordErr: '',
      confirmPasswordErr: '',
      message: '',
    };
  }

  private validateForm(data: {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): boolean {
    let isValid = true;


    if (!data.userName) {
      this.errs.userNameErr =
        'Username is required.';
      isValid = false;
    }

    if (!data.email) {
      this.errs.emailErr =
        'Email is required.';
      isValid = false;
    }

    if (!data.password) {
      this.errs.passwordErr =
        'Password is required.';
      isValid = false;
    }

    if (!data.confirmPassword) {
      this.errs.confirmPasswordErr =
        'Please confirm your password.';
      isValid = false;
    }

    if (
      data.password &&
      data.confirmPassword &&
      data.password !==
      data.confirmPassword
    ) {
      this.errs.confirmPasswordErr =
        'Passwords do not match.';
      isValid = false;
    }

    if (
      data.email &&
      !this.isValidEmail(data.email)
    ) {
      this.errs.emailErr =
        'Please enter a valid email address.';
      isValid = false;
    }

    this.cdr.markForCheck();

    return isValid;


  }

  private isValidEmail(
    email: string
  ): boolean {
    return /^[^\s@]+@[^\s@]+.[^\s@]+$/.test(
      email
    );
  }

  private handleServerError(
    err: HttpErrorResponse
  ): void {
    const validationArr =
      err?.error?.validationArr;


    if (
      Array.isArray(validationArr) &&
      Array.isArray(validationArr[0])
    ) {
      const errors = validationArr[0];

      errors.forEach((item: any) => {
        const field: any =
          this.extractFieldFromMessage(
            item?.message
          );

        if (!field) {
          return;
        }

        const message =
          String(item?.message || '');

        if (
          field === 'userName'
        ) {
          this.errs.userNameErr =
            message;
        }

        if (field === 'email') {
          this.errs.emailErr =
            message;
        }

        if (
          field === 'password'
        ) {
          this.errs.passwordErr =
            message;
        }

        if (
          field ===
          'confirmPassword'
        ) {
          this.errs.confirmPasswordErr =
            message;
        }
      });

      return;
    }

    this.errs.message =
      String(
        err?.error?.message ||
        'Something went wrong. Please try again.'
      );


  }

  private extractFieldFromMessage(
    message: unknown | any
  ): keyof Omit<
    SignupErrors,
    'message'

  > | null { if ( typeof message !== 'string'     ) { return null; }


    const match =
      message.match(
        /^['"]?([a-zA-Z]+)['"]?\s/
      );

    if (!match) {
      return null;
    }

    const field:any =
      match[1];

    if (
      field === 'userName' ||
      field === 'email' ||
      field === 'password' ||
      field ===
      'confirmPassword'
    ) {
      return field;
    }

    return null;


  }
}
