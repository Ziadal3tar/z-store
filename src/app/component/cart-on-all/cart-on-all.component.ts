import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedService } from '../../services/shared.service';
import { ProductsService } from '../../services/products.service';
import { UserService } from '../../services/user.service';
import { CartService } from 'src/app/services/cart.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-cart-on-all',
  templateUrl: './cart-on-all.component.html',
  styleUrls: ['./cart-on-all.component.css'],
})
export class CartOnAllComponent implements OnInit {
  ClickEventSubscription: Subscription;
  @Input() sideCart = '';
  @Input() cartlength: any;
  cart: any;
  allProduct: any = [];
  token = localStorage.getItem('userToken');
  allPrice = [];
  @Input() userData: any;

  @Input() subtotal: any
  @Output() closeCart: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private UserService: UserService,
    private ProductsService: ProductsService,
    private SharedService: SharedService,
    private CartService: CartService,
    private Router: Router
  ) {
    this.ClickEventSubscription = this.SharedService.getClickEvent().subscribe(
      (data) => {
      }
    );
  }

  ngOnInit(): void {
  }



  deleteFromCart(productId: any) {
    const product = { productId, userId: this.userData._id };
    this.CartService.deleteFromCart(product).subscribe((data: any) => {
      if (data.message == 'removeProduct') {
        this.SharedService.updateUserData()
      }
    });
  }

  backCart() {
    this.sideCart = '';
    this.closeCart.emit(this.sideCart);
  }


}
