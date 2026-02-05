import { StoresService } from './stores.service';
import { Router } from '@angular/router';
import { CouponService } from 'src/app/services/coupon.service';
import { BrandsService } from 'src/app/services/brands.service';
import { CategoryService } from './category.service';
import { CartService } from './cart.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ProductsService } from './products.service';
import { UserService } from './user.service';
import { SubCategoriesService } from './sub-categories.service';
import { HttpErrorResponse } from '@angular/common/http';
import { io } from 'socket.io-client';
@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private baseUrl = 'https://z-store-apis-b6lh.vercel.app/';

  socket: any;
  private userData = new BehaviorSubject<any>([]);
  currentUserData = this.userData.asObservable();

  private allAdmins = new BehaviorSubject<any>([]);
  currentAllAdmins = this.allAdmins.asObservable();

  private allCoupons = new BehaviorSubject<any>([]);
  currentAllCoupon = this.allCoupons.asObservable();

  private allCategories = new BehaviorSubject<any>([]);
  currentAllCategories = this.allCategories.asObservable();

  private allSubCategories = new BehaviorSubject<any>([]);
  currentAllSubCategories = this.allSubCategories.asObservable();

  private allBrands = new BehaviorSubject<any>([]);
  currentAllBrands = this.allBrands.asObservable();

  private allProducts = new BehaviorSubject<any>([]);
  currentAllProduct = this.allProducts.asObservable();

  private storeData = new BehaviorSubject<any>([]);
  currentStoreData = this.storeData.asObservable();

  cart: any;
  userdata: any;
  subtotal: any;

  private subject = new Subject<any>();

  constructor(
    private UserService: UserService,
    private ProductsService: ProductsService,
    private CartService: CartService,
    private CategoryService: CategoryService,
    private subCategoryService: SubCategoriesService,
    private brandService: BrandsService,
    private CouponService: CouponService,
    private StoresService: StoresService,
    private router: Router
  ) {
    // this.socket = io(this.baseUrl)
  }
  // listen(eventName: any) {
  //   return new Observable((Subscriber) => {
  //     this.socket.on(eventName, (data: any) => {
  //       Subscriber.next(data);
  //     });
  //   });
  // }
  ngOnInit(): void {}
  emit(eventName: any, data: any) {
    this.socket.emit(eventName, data);
  }
  updateUserData() {
    if (localStorage.getItem('userToken')) {
      this.UserService.getUserData(localStorage.getItem('userToken')).subscribe(
        (data: any) => {
          this.userData.next(data.user);
        },
        (err: HttpErrorResponse) => {
          console.log(err);

          if (
            err.error.message == 'jwt expired' ||
            err.error.message == 'jwt malformed'
          ) {
            localStorage.removeItem('userToken');
            this.router.navigate([`/login`]);
          } else {
            localStorage.removeItem('userToken');
            this.router.navigate(['/login']);
          }
        }
      );
    }else{
      this.userData.next(undefined);
    }
  }
  updateCategories() {
    this.CategoryService.allCategory().subscribe((data: any) => {
      this.allCategories.next(data.categories);
    });
  }

  updateSubCategories() {
    this.subCategoryService.allSubCategory().subscribe((data: any) => {
      this.allSubCategories.next(data.allSubCategories);
    });
  }
  updateBrands() {
    this.brandService.allBrands().subscribe((data: any) => {
      this.allBrands.next(data.brands);
    });
  }
  updateCoupons() {
    this.CouponService.getCoupons().subscribe((data: any) => {
      this.allCoupons.next(data.coupons);
    });
  }
  updateAdmins() {
    this.UserService.getAllAdmin().subscribe((data: any) => {
      this.allAdmins.next(data.admins);
    });
  }
  updateProducts() {
    this.ProductsService.getProduct().subscribe((data: any) => {
      this.allProducts.next(data.products);
    });
  }
  updateStoreData(id: any) {
    this.StoresService.getStore(id).subscribe((data: any) => {
      this.storeData.next(data.store);
    });
  }

  sendClickEvent() {
    this.subject.next({});
  }

  updateAllProduct(id: any) {
    this.subject.next(id);
  }

  getClickEvent(): Observable<any> {
    return this.subject.asObservable();
  }

  updateAllData() {
    this.updateAdmins();
    this.updateSubCategories();
    this.updateBrands();
    this.updateCategories();
    this.updateCoupons();
    this.updateBrands();
    this.updateUserData();
    this.updateProducts();
  }

  addToCart(id: any) {
    const product = {
      productId: id,
      quantity: 1,
    };
    const token = localStorage.getItem('userToken');
    this.CartService.addToCart(product).subscribe((data: any) => {
      this.sendClickEvent();
    });
  }

  deleteFromFavorites(id: any) {
    const product = {
      productId: id,
    };
    const token = localStorage.getItem('userToken');

    this.UserService.deleteFromFavorites(token, product).subscribe(
      (data: any) => {}
    );
  }
}
