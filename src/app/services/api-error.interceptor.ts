import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';

import { clearAuthToken } from '../auth-token.util';

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isAuthRequest(request.url)) {
          clearAuthToken();

          if (this.router.url !== '/login') {
            this.router.navigate(['/login']);
          }
        }

        return throwError(() => error);
      })
    );
  }

  private isAuthRequest(url: string): boolean {
    return /\/auth\/(logIn|signUp)(?:\/|$)/i.test(url);
  }
}
