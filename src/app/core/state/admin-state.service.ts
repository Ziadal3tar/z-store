import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { CouponService } from 'src/app/core/services/coupon.service';
import { UserService } from 'src/app/core/services/user.service';

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

  replaceCoupons(coupons: any[]): void {
    this.couponsSubject.next(Array.isArray(coupons) ? coupons : []);
  }

  upsertCoupon(coupon: any): void {
    if (!coupon?._id) return;
    const items = [...this.couponsSubject.value];
    const index = items.findIndex(item => item?._id === coupon._id);
    if (index >= 0) items[index] = { ...items[index], ...coupon };
    else items.unshift(coupon);
    this.couponsSubject.next(items);
  }

  removeCoupon(id: string): void {
    this.couponsSubject.next(this.couponsSubject.value.filter(item => item?._id !== id));
  }

  replaceAdmins(admins: any[]): void {
    this.adminsSubject.next(Array.isArray(admins) ? admins : []);
  }

  refreshAll(): void {
    this.refreshAdmins();
    this.refreshCoupons();
  }
}
