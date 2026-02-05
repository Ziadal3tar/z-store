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

  productDetails: any
  openProductDetails = false
  filters = '';
  allData: any;
  categoryId: any;
  subCategoryId: any;
  brandId: any;
  userData: any
  loginFirst: any = false
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
  ) { }

  ngOnInit(): void {

    this.SharedService.currentUserData.subscribe((data => {
      this.userData = data


    }))
    this.SharedService.currentAllProduct.subscribe((data: any) => {
      this.products = data
    })
  }

  onProductsChange(products: any) {
    this.products = products;
  }

ifInWishlist(item: any): boolean {
  return !!this.userData?.wishlist?.some((w: any) => w?._id === item?._id);
}
select(): void {
  const getVal = (id: string) =>
    (document.getElementById(id) as HTMLInputElement)?.value ?? null;

  this.categoryId = getVal('categoryId_AP');
  this.subCategoryId = getVal('subCategoryId_AP');
  this.brandId = getVal('brandId_AP');
}

addToCart(id: any): void {
  if (!this.userData) {
    this.loginFirst = true;
    return;
  }

  const product = {
    productId: id,
    quantity: 1,
  };

  this.CartService.addToCart(product).subscribe({
    next: (_data: any) => {
      this.SharedService.updateUserData();
      this.SharedService.sendClickEvent();
    },
    error: (err: any) => {
      console.error('addToCart error', err);
    },
  });
}

 addToFavorites(id: any, event?: Event): void {
  if (!this.userData) {
    this.loginFirst = true;
    return;
  }

  const inWishlist = !!this.userData?.wishlist?.some((w: any) => w?._id === id);

  const toggleDomHeart = (addFill: boolean) => {
    const target = (event?.target as HTMLElement) ?? null;
    if (!target || !target.classList) return;
    if (addFill) {
      target.classList.add('bi-heart-fill', 'text-danger');
      target.classList.remove('bi-heart');
    } else {
      target.classList.remove('bi-heart-fill', 'text-danger');
      target.classList.add('bi-heart');
    }
  };

  if (inWishlist) {
    // إزالة من المفضلة
    this.WishListService.removeToFavorites(id).subscribe({
      next: (res: any) => {
        if (res?.message === 'Done') {
          toggleDomHeart(false);
          this.SharedService.updateUserData();
        }
      },
      error: (err: any) => {
        console.error('removeToFavorites error', err);
      },
    });
    return;
  }

  // إضافة إلى المفضلة
  const payload = { productId: id };
  this.WishListService.addToFavorites(payload).subscribe({
    next: (res: any) => {
      if (res?.message === 'Done') {
        toggleDomHeart(true);
        this.SharedService.updateUserData();
      }
    },
    error: (err: any) => {
      console.error('addToFavorites error', err);
    },
  });
}
}
