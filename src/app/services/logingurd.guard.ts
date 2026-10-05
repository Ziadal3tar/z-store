import { clearAuthToken, getAuthToken, isAuthTokenValid } from 'src/app/core/auth-token.util';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LogingurdGuard implements CanActivate {
  constructor(private readonly router: Router) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): boolean | UrlTree {
    const token = getAuthToken();
    if (token && isAuthTokenValid(token)) {
      return true;
    }

    if (token) clearAuthToken();
    return this.router.createUrlTree(['/login']);
  }
}
