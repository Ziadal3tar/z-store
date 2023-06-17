import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { CartOnAllComponent } from '../cart-on-all/cart-on-all.component';
import { SharedService } from '../../services/shared.service';
import { UserService } from '../../services/user.service';
import { CartService } from 'src/app/services/cart.service';
import { CouponService } from 'src/app/services/coupon.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  providers: [CartOnAllComponent],
})
export class CartComponent implements OnInit {
  // ClickEventSubscription: Subscription;
  cart: any;
  subtotal: any;
  @Input() cartlength: any;
  userData: any;
  token = localStorage.getItem('userToken');
  Total: any;
  Discount = 0;
  quantityErrMessage: any;
  couponErr: any;
  coupon: any;
  couponData:any
index:any
  constructor(
    private UserService: UserService,
    private SharedService: SharedService,
    private CartService: CartService,
    private CouponService: CouponService
  ) {
    // this.ClickEventSubscription = this.SharedService.getClickEvent().subscribe(
    //   (data: any) => {
    //     this.getCart();
    //   }
    // );
  }

  ngOnInit(): void {
    // this.getCart();
    this.SharedService.currentUserData.subscribe((data:any)=>{
      this.userData = data
      this.cart = this.userData?.cartId



      this.Subtotal()
    })
  }

  getCart() {
    this.CartService.getCart(localStorage.getItem('userToken')).subscribe(
      (data: any) => {
        this.cart = data.cart;
        this.Subtotal();
      }
    );
  }
  deleteFromCart(productId: any) {
    const product = {
      productId,
      userId: localStorage.getItem('userId'),
    };
    this.CartService.deleteFromCart(product).subscribe((data) => {
      this.getCart();
      this.SharedService.sendClickEvent();
    });
  }

  plus(i: any) {
    this.quantityErrMessage = '';
this.index = i
    const product = {
      index: i,
      productId: this.cart.products[i].productId._id,
      quantity: '',
    };
    const token = localStorage.getItem('userToken');
    if (
      this.cart.products[i]?.quantity < this.cart.products[i].productId.stock
    ) {
      this.cart.products[i].quantity++;
      product.quantity = this.cart.products[i].quantity;
      this.CartService.changeQuantityOfProductInCart(token, product).subscribe(
        (data: any) => {
          this.SharedService.updateUserData()
          this.SharedService.sendClickEvent();
        }
      );
    } else if (
      this.cart.products[i]?.quantity == this.cart.products[i].productId.stock
    ) {
      this.quantityErrMessage = 'cant more';
      setTimeout(() => {
        this.quantityErrMessage = '';
      }, 1000);
    }
  }

  minus(i: any) {
this.index = i

    const product = {
      index: i,
      productId: this.cart.products[i].productId._id,
      quantity: '',
    };
    const token = localStorage.getItem('userToken');
    if (this.cart.products[i]?.quantity > 1) {
      this.cart.products[i].quantity--;
      product.quantity = this.cart.products[i].quantity;
      this.CartService.changeQuantityOfProductInCart(token, product).subscribe(
        (data: any) => {
          this.discount(this.couponData?.amount)
          this.SharedService.sendClickEvent();
        }
      );
    } else if (this.cart.products[i]?.quantity == 1) {
      this.quantityErrMessage = "can't be less than 1";
      setTimeout(() => {
        this.quantityErrMessage = '';
      }, 1000);
    }
  }

  ondrop(event: CdkDragDrop<string[]>) {

    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex

      );
      const token = localStorage.getItem('userToken');
      const data = {
        allProduct: this.cart.products,
      };
      this.UserService.saveAfterDrag(token, data).subscribe((data: any) => {


console.log('r');

      });
  }

  Subtotal() {

    if (this.Discount == 0) {
    }
    if (this.cart?.products?.length == 0) {
      this.Total = 0;
    } else {
      let sum = 0;
      for (let i = 0; i < this.cart?.products?.length; i++) {
        const element = this.cart.products[i];
        sum += element.quantity * element.productId.finalPrice;
      }
      this.Total = sum.toFixed(1);

    }
  }
  addCoupon() {
    this.CouponService.getCoupon(this.coupon).subscribe(
      (data: any) => {
        if (data.message == 'coupon') {
          this.couponData = data.coupon
          this.discount(data.coupon?.amount);
          this.coupon = '';
        }
      },
      (err: HttpErrorResponse) => {
        this.couponErr = err.error.message;
        setTimeout(() => {
          this.couponErr = '';
        }, 1000);
      }
    );
  }
  discount(amount: any) {

    let discount = (this.Total / 100) * amount;
    this.Discount = parseInt(discount.toFixed(1));
    this.Subtotal()
  }
}
