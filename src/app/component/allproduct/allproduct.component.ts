import { CartService } from './../../services/cart.service';
import { WishListService } from './../../services/wish-list.service';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from './../../services/shared.service';
import { StoresService } from './../../services/stores.service';
import { UserService } from './../../services/user.service';
import { Options, LabelType } from 'ng5-slider';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ProductsService } from '../../services/products.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-allproduct',
  templateUrl: './allproduct.component.html',
  styleUrls: ['./allproduct.component.css'],
})
export class AllproductComponent implements OnInit {
  @Input() products: any;
  @Input() userData: any;
  storeId:any
  productDetails:any
  openProductDetails=false




  constructor(
    private ProductsService: ProductsService,
    private UserService: UserService,
    private StoresService: StoresService,
    private SharedService:SharedService,
    private _activatedRoute: ActivatedRoute,
    private WishListService:WishListService,
    private CartService:CartService


  ) {    this.storeId = _activatedRoute.snapshot.params['id'];
}

  ngOnInit(): void {
//     this.ProductsService.getStoresProducts(this.storeId).subscribe((data:any)=>{
// this.products = data.products
// console.log(this.products);

//     })
this.SharedService.currentUserData.subscribe((data:any)=>{
  this.userData = data

})
  }


  ifInWishlist(item:any):any{
    for (let i = 0; i < this.userData?.wishlist?.length; i++) {
      const element = this.userData.wishlist[i];
      if (element._id == item._id) {
        return true
      }
    }
    return false
  }



  addToCart(id: any) {
    const product = {
      productId: id,
      quantity: 1,
    };

    this.CartService.addToCart(product).subscribe((data: any) => {
      this.SharedService.updateUserData()
      this.SharedService.sendClickEvent();
    });
  }

  addToFavorites(id: any,event:any) {
    let data = {
      productId: id,
    };
    for (let i = 0; i < this.userData?.wishlist?.length; i++) {
      const element = this.userData.wishlist[i];
      if (element._id == id) {
         this.WishListService.removeToFavorites(data.productId).subscribe((data:any)=>{
          if (data.message == 'Done') {
            event.target.classList.remove("bi-heart-fill","text-danger")
            event.target.classList.add("bi-heart")
            return
          }
        })
      }
    }
    this.WishListService.addToFavorites(data).subscribe((data: any) => {
      if (data.message == 'Done') {
        event.target.classList.add("bi-heart-fill","text-danger")
        event.target.classList.remove("bi-heart")
        this.SharedService.updateUserData()

      }
    });
  }
}
