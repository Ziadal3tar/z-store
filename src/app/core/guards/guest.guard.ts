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
export class GuestGuard implements CanActivate {
  constructor(private readonly router: Router) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): boolean | UrlTree {
    const token = getAuthToken();


    if (token && isAuthTokenValid(token)) {
      return this.router.createUrlTree(['/home']);
    }

    if (token) clearAuthToken();
    return true;
  }
}
