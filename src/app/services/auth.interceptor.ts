import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { getAuthToken } from '../auth-token.util';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = getAuthToken();

    if (!token) {
      return next.handle(request);
    }

    const authRequest = request.clone({
      setHeaders: {
        authorization: `Bearer__${token}`,
      },
    });

    return next.handle(authRequest);
  }
}
