import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { clearAuthToken, getAuthToken } from '../auth-token.util';

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {
  constructor(private readonly router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401 && getAuthToken() && !this.isAuthEndpoint(request.url)) {
          clearAuthToken();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      }),
    );
  }

  private isAuthEndpoint(url: string): boolean {
    return /\/(logIn|signUp)(?:[/?#]|$)/i.test(url);
  }
}
