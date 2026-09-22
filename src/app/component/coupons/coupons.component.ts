import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';

import {
  Subject,
  takeUntil,
} from 'rxjs';

import { CouponService } from 'src/app/services/coupon.service';
import { AdminStateService } from 'src/app/core/state/admin-state.service';

type CouponModal =
  | 'details'
  | 'edit'
  | 'enable'
  | null;

interface Coupon {
  _id?: string;
  name?: string;
  amount?: number;
  expireIn?: string;
  isStopped?: boolean;

  createdBy?: {
    userName?: string;
  };

  updatedBy?: {
    userName?: string;
  };

  deletedBy?: {
    userName?: string;
  };
}

@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.component.html',
  styleUrls: ['./coupons.component.css'],
  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class CouponsComponent
  implements OnInit, OnDestroy
{
  @Input() allData: any;

  couponName = '';
  editName = '';

  couponAmount: number | null =
    null;

  couponExpireIn = '';

  allCoupons: Coupon[] = [];

  item?: Coupon;
  couponDetails?: Coupon;

  modal: CouponModal = null;

  errMessage = '';

  private readonly destroy$ =
    new Subject<void>();

  private errorTimer?: ReturnType<
    typeof setTimeout
  >;

  constructor(
    private readonly couponService: CouponService,
    private readonly adminState: AdminStateService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.adminState.coupons$
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: Coupon[]) => {
          this.allCoupons =
            Array.isArray(data)
              ? data
              : [];

          this.cdr.markForCheck();
        }
      );

    this.adminState.refreshCoupons();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.errorTimer) {
      clearTimeout(
        this.errorTimer
      );
    }
  }

  get activeCoupons(): Coupon[] {
    return this.allCoupons.filter(
      (coupon) =>
        !coupon?.isStopped
    );
  }

  get disabledCoupons(): Coupon[] {
    return this.allCoupons.filter(
      (coupon) =>
        !!coupon?.isStopped
    );
  }

  addCoupon(): void {
    const name =
      this.couponName.trim();

    if (!name) {
      return;
    }

    this.clearError();

    this.couponService
      .addCoupon({ name })
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.adminState.refreshCoupons();

          this.couponName = '';

          this.cdr.markForCheck();
        },

        error: (
          error: HttpErrorResponse
        ) => {
          this.showError(
            error?.error?.message ||
              'Unable to create coupon.'
          );
        },
      });
  }

  couponOption(
    type:
      | CouponModal
      | 'disable'
      | 'closeAll',
    item: Coupon | null
  ): void {
    if (type === 'closeAll') {
      this.closeModal();
      return;
    }

    this.item =
      item || undefined;

    if (!this.item) {
      return;
    }

    if (type === 'details') {
      this.openDetails(
        this.item
      );
      return;
    }

    if (type === 'edit') {
      this.prepareEdit(
        this.item
      );

      this.modal = 'edit';

      this.cdr.markForCheck();
      return;
    }

    if (type === 'enable') {
      this.prepareEdit(
        this.item
      );

      this.modal = 'enable';

      this.cdr.markForCheck();
      return;
    }

    if (type === 'disable') {
      this.disableCoupon(
        this.item
      );
    }
  }

  openDetails(
    coupon: Coupon
  ): void {
    if (!coupon?._id) {
      return;
    }

    this.couponDetails =
      undefined;

    this.modal = 'details';

    this.cdr.markForCheck();

    this.couponService
      .getCouponById(coupon._id)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: any) => {
          this.couponDetails =
            data?.coupon;

          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'Failed to load coupon details:',
            error
          );

          this.showError(
            'Unable to load coupon details.'
          );

          this.closeModal();
        },
      });
  }

  prepareEdit(
    coupon: Coupon
  ): void {
    this.editName =
      coupon?.name || '';

    this.couponAmount =
      coupon?.amount != null
        ? Number(coupon.amount)
        : null;

    this.couponExpireIn =
      coupon?.expireIn || '';
  }

  editCoupon(
    type: 'enable' | null
  ): void {
    if (!this.item) {
      return;
    }

    const name =
      this.editName.trim();

    if (
      !name ||
      this.couponAmount == null
    ) {
      return;
    }

    const data = {
      oldName:
        this.item.name,

      name,

      amount:
        this.couponAmount,

      expireIn:
        this.couponExpireIn,

      type,
    };

    this.couponService
      .updateCoupon(data)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (
            response?.message ===
            'updated'
          ) {
            this.adminState.refreshCoupons();
            this.closeModal();
          }
        },

        error: (error) => {
          console.error(
            'Update coupon failed:',
            error
          );

          this.showError(
            'Unable to update coupon.'
          );
        },
      });
  }

  disableCoupon(
    coupon: Coupon
  ): void {
    if (!coupon?.name) {
      return;
    }

    this.couponService
      .stopCoupon(coupon.name)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (
            response?.message ===
            'done'
          ) {
            this.adminState.refreshCoupons();
          }
        },

        error: (error) => {
          console.error(
            'Disable coupon failed:',
            error
          );

          this.showError(
            'Unable to disable coupon.'
          );
        },
      });
  }

  removeCoupon(
    id?: string
  ): void {
    if (!id) {
      return;
    }

    this.couponService
      .removeCoupon(id)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (
            response?.message ===
            'deleted'
          ) {
            this.adminState.refreshCoupons();
          }
        },

        error: (error) => {
          console.error(
            'Delete coupon failed:',
            error
          );

          this.showError(
            'Unable to delete coupon.'
          );
        },
      });
  }

  closeModal(): void {
    this.modal = null;

    this.item = undefined;

    this.couponDetails =
      undefined;

    this.editName = '';

    this.couponAmount = null;

    this.couponExpireIn = '';

    this.cdr.markForCheck();
  }

  formatAmount(
    amount: any
  ): string {
    if (
      amount == null ||
      amount === ''
    ) {
      return '—';
    }

    const value =
      Number(amount);

    if (!Number.isFinite(value)) {
      return String(amount);
    }

    return value.toString();
  }

  trackByCoupon(
    index: number,
    coupon: Coupon
  ): string | number {
    return (
      coupon?._id ||
      index
    );
  }

  private showError(
    message: string
  ): void {
    this.errMessage = message;

    if (this.errorTimer) {
      clearTimeout(
        this.errorTimer
      );
    }

    this.errorTimer =
      setTimeout(() => {
        this.errMessage = '';

        this.cdr.markForCheck();
      }, 3000);

    this.cdr.markForCheck();
  }

  private clearError(): void {
    this.errMessage = '';

    if (this.errorTimer) {
      clearTimeout(
        this.errorTimer
      );

      this.errorTimer =
        undefined;
    }
  }
}
