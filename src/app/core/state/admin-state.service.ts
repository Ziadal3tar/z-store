import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { CouponService } from 'src/app/services/coupon.service';
import { UserService } from 'src/app/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AdminStateService {
  private readonly adminsSubject = new BehaviorSubject<any[]>([]);
  private readonly couponsSubject = new BehaviorSubject<any[]>([]);

  readonly admins$ = this.adminsSubject.asObservable();
  readonly coupons$ = this.couponsSubject.asObservable();

  constructor(
    private readonly userService: UserService,
    private readonly couponService: CouponService
  ) {}

  refreshAdmins(): void {
    this.userService.getAllAdmin().subscribe({
      next: (response: any) => {
        this.adminsSubject.next(
          Array.isArray(response?.admins) ? response.admins : []
        );
      },
    });
  }

  refreshCoupons(): void {
    this.couponService.getCoupons().subscribe({
      next: (response: any) => {
        this.couponsSubject.next(
          Array.isArray(response?.coupons) ? response.coupons : []
        );
      },
    });
  }

  refreshAll(): void {
    this.refreshAdmins();
    this.refreshCoupons();
  }
}
