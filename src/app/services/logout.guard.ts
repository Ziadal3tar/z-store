import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree ,Router} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogoutGuard implements CanActivate {
  constructor(
    private Router:Router,
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
if (localStorage.getItem("userToken") == null) {
  return true;
}else{
  this.Router.navigate([`/home`]);
  return false;
}
  }

}
