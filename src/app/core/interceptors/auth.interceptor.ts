import { getAuthToken } from 'src/app/core/auth-token.util';
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = getAuthToken();

    if (!token || request.headers.has('authorization')) {
      return next.handle(request);
    }

    return next.handle(
      request.clone({
        setHeaders: {
          authorization: `Bearer__${token}`,
        },
      }),
    );
  }
}
