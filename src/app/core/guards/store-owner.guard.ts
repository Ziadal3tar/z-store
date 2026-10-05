import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../models/user.model';
import { UserStateService } from '../state/user-state.service';

@Injectable({
  providedIn: 'root',
})
export class StoreOwnerGuard implements CanActivate {
  constructor(
    private readonly userState: UserStateService,
    private readonly router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    const storeId = route.paramMap.get('id');

    if (!storeId) {
      return of(this.router.parseUrl('/shop'));
    }

    const decide = (user: User | undefined): boolean | UrlTree => {
      const isAdmin = String(user?.role ?? '').toLowerCase() === 'admin' || user?.isAdmin === true;
      const ownedStoreId = String(user?.storeId ?? '');

      return isAdmin || ownedStoreId === storeId
        ? true
        : this.router.parseUrl('/home');
    };

    const snapshot = this.userState.snapshot;
    if (snapshot) {
      return of(decide(snapshot));
    }

    return this.userState.refresh().pipe(map(user => decide(user)));
  }
}
