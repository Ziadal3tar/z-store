import { NavbarComponent } from './../navbar/navbar.component';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Component, OnInit, Output } from '@angular/core';
import { Options, LabelType } from 'ng5-slider';
import { SharedService } from '../../services/shared.service';
import { UserService } from '../../services/user.service';
import { ProductsService } from '../../services/products.service';
import { Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { WishListService } from 'src/app/services/wish-list.service';
@Component({
  selector: 'app-male',
  templateUrl: './male.component.html',
  styleUrls: ['./male.component.css'],
  providers: [],
})
export class MaleComponent implements OnInit {
  cartlength: any;

  index: any;

  products: any = [];

  searchingFor: any;


  specifiedCategory: any;

  productDetails:any
  openProductDetails=false
  filters = '';
  allData: any;
  categoryId: any;
  subCategoryId: any;
  brandId: any;
  userData:any
  loginFirst:any = false
  sizes = ['sm', 'md', 'lg', 'xl', 'free'];
  status = 'Dead';
  colors = [
    'red',
    'yellow',
    'green',
    'white',
    'black',
    'gray',
    'blue',
    'brown',
    'orange',
    'gold',
    'Purple',
    'Silver',
    'Pink',
    'Teal',
    'Beige',
    'navy',
  ];

  imgProduct: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    nav: false,
    autoplay: true,
    autoplayTimeout: 5000,
    navSpeed: 700,
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      740: {
        items: 1,
      },
      940: {
        items: 1,
      },
    },
  };

  minValue: number = 100;

  maxValue: number = 10000;

  options: Options = {
    floor: 100,
    ceil: 10000,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return `<b>Min price:</b> $${value}`;
        case LabelType.High:
          return `<b>Max price:</b> $${value}`;
        default:
          return `$${value}`;
      }
    },
  };

  constructor(
    private ProductsService: ProductsService,
    private UserService: UserService,
    private SharedService: SharedService,
    private CartService: CartService,
    private WishListService: WishListService
  ) {}

  ngOnInit(): void {

    this.SharedService.currentUserData.subscribe((data=>{
this.userData = data


    }))
    this.SharedService.currentAllProduct.subscribe((data:any)=>{
this.products = data
    })
  }

  onProductsChange(products: any) {
    this.products = products;
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
  select() {
    this.categoryId = (<HTMLInputElement>(
      document.getElementById('categoryId_AP')
    )).value;
    this.subCategoryId = (<HTMLInputElement>(
      document.getElementById('subCategoryId_AP')
    )).value;
    this.brandId = (<HTMLInputElement>(
      document.getElementById('brandId_AP')
    )).value;
  }

  addToCart(id: any) {
    if (this.userData == undefined) {
      this.loginFirst = true
return
    }
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
    if (this.userData || this.userData != '') {
      this.loginFirst = true
return
    }
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
