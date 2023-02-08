import { SharedService } from 'src/app/services/shared.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { CouponService } from 'src/app/services/coupon.service';

@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.component.html',
  styleUrls: ['./coupons.component.css'],
})
export class CouponsComponent implements OnInit {
  couponName: any;
  editName: any;
  couponAmount: any;
  couponExpireIn: any;
  allCoupons: any;
  openEdit = true;
  detailsDiv = true;
  editDiv = true;
  enableDiv = true;
  errMessage: any;
  errMessageStyle = 'opacity-0 transition';
  item: any;
  couponDetails: any;
  @Input() allData: any;

  constructor(
    private CouponService: CouponService,
    private SharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.SharedService.currentAllCoupon.subscribe((data:any)=>{
this.allCoupons =data
    })
  }

  addCoupon() {
    let data = {
      name: this.couponName,
    };
    if (data.name) {
      this.CouponService.addCoupon(data).subscribe(
        (data: any) => {
          this.SharedService.updateCoupons();
          this.couponName = '';
        },
        (err: HttpErrorResponse) => {
          if (err.error.message) {
            this.errMessage = err.error.message;
            this.errMessageStyle = 'opacity-100 transition';
            setTimeout(() => {
              this.errMessageStyle = 'opacity-0 transition';
              setTimeout(() => {
                this.errMessage = '';
              }, 500);
            }, 2000);
          }
        }
      );
    }
  }

  couponOption(type: any, item: any) {
    this.item = item;
    if (type == 'edit') {
      this.openEdit = !this.openEdit;
      this.editDiv = !this.editDiv;
      this.detailsDiv = true;
      this.enableDiv = true;
    } else if (type == 'details') {
      this.openEdit = !this.openEdit;
      this.detailsDiv = !this.detailsDiv;
      this.editDiv = true;
      this.enableDiv = true;
      this.CouponService.getCouponById(item._id).subscribe((data: any) => {
        this.couponDetails = data.coupon;
      });
    } else if (type == 'enable') {
      this.openEdit = !this.openEdit;
      this.detailsDiv = true;
      this.editDiv = true;
      this.enableDiv = !this.enableDiv;
    } else if (type == 'disable') {
      this.CouponService.stopCoupon(item.name).subscribe((data: any) => {
        if (data.message == 'done') {
          this.SharedService.updateCoupons();
        }
      });
    } else {
      this.openEdit = true;
      this.detailsDiv = true;
      this.editDiv = true;
      this.enableDiv = true;
    }
  }
  editCoupon(type: any) {
    let data = {
      oldName: this.item.name,
      name: this.editName,
      amount: this.couponAmount,
      expireIn: this.couponExpireIn,
      type,
    };
    this.CouponService.updateCoupon(data).subscribe((data: any) => {
      if (data.message == 'updated') {
        this.SharedService.updateCoupons();
        this.openEdit = !this.openEdit;
      }
    });
  }

  removeCoupon(id: any) {
    this.CouponService.removeCoupon(id).subscribe((data: any) => {
      if (data.message == 'deleted') {
        this.SharedService.updateCoupons();
      }
    });
  }
}
