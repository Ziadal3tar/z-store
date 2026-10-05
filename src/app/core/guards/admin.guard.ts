import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserStateService } from '../state/user-state.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private readonly userState: UserStateService,
    private readonly router: Router,
  ) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    const currentUser = this.userState.snapshot;
    if (this.isAdmin(currentUser)) {
      return of(true);
    }

    return this.userState.refresh().pipe(
      map((user) => this.isAdmin(user) || this.router.createUrlTree(['/home'])),
      catchError(() => of(this.router.createUrlTree(['/home']))),
    );
  }

  private isAdmin(user: { role?: string; isAdmin?: boolean } | undefined): boolean {
    return user?.role === 'Admin' || user?.isAdmin === true;
  }
}
