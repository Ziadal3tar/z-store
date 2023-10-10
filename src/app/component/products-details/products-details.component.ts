import { SharedService } from './../../services/shared.service';
import { Component, OnInit, Input } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
@Component({
  selector: 'app-products-details',
  templateUrl: './products-details.component.html',
  styleUrls: ['./products-details.component.css'],
})
export class ProductsDetailsComponent implements OnInit {
  storeData: any;
  indexx = 0;
  theNumberOfPieces: any = 1;
  message = '.';
  userData: any;

  loginFirst:any = false
  @Input() productDetails: any;
  constructor(
    private SharedService: SharedService,
    private CartService: CartService
  ) {}
  ngOnInit(): void {
    this.SharedService.currentUserData.subscribe((data=>{
this.userData = data


    }))}
  plus() {
    if (this.theNumberOfPieces >= this.productDetails.stock) {
      this.message = "We don't have more";
      this.theNumberOfPieces = this.productDetails.stock;
    } else if (this.productDetails.stock >= 0) {
      this.message = '.';
      this.theNumberOfPieces++;
    } else {
      this.theNumberOfPieces++;
    }
  }
  minuus() {
    if (this.theNumberOfPieces == 0) {
      this.theNumberOfPieces = 0;
      this.message = 'How many do you need';
    } else {
      this.theNumberOfPieces--;
      this.message = '.';
    }
  }
  addToCart() {
    if (this.userData == undefined) {
      this.loginFirst = true
return
    }
    if (this.theNumberOfPieces === 0) {
      this.message = 'How many do you need';
    } else {
      this.message = '.';

      const product = {
        productId: this.productDetails._id,
        quantity: this.theNumberOfPieces,
      };
      this.CartService.addToCart(product).subscribe((data: any) => {
        if (data.message == 'updated' || data.message == 'Added') {
          this.theNumberOfPieces = 1;
          this.SharedService.updateUserData();
        }
      });
    }
  }
}
