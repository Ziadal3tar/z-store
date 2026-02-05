import { SharedService } from 'src/app/services/shared.service';
import { StoresService } from './../../services/stores.service';
import { Component, OnInit, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  providers: [UserService],
})
export class NavbarComponent implements OnInit {
  openSearch = false;
  @Input() cartlength: any;
  onScroll = 'navbar-light';
  ScrollY = 0;
  sideCart = 'close';
  sideNav = 'close';
  cart: any;
  allProduct: any = [];
  subtotal: any
  userData: any;
  nameSearch: any;
  searched: any = [];
  allData: any;

  constructor(
    private router: Router,
    private ProductsService: ProductsService,
    private StoresService: StoresService,
    private SharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.SharedService.updateAllData();

    // this.SharedService.listen('resevMessage').subscribe((data: any) => {
    //   // this.SharedService.updateStoreData(this.storeId)
    // });
    this.SharedService.currentUserData.subscribe((data: any) => {
      this.userData = data;
      this.Subtotal();
    });
  }
  Subtotal() {
if (this.userData?.cartId?.products?.length==0) {
this.subtotal = 0
}else{


    let sum = 0;
      for (let i = 0; i < this.userData?.cartId?.products?.length; i++) {
        const element = this.userData?.cartId?.products[i];
        sum += element.quantity * element.productId?.finalPrice;
        this.subtotal = sum;

      }
    }
  }
  showNav() {
    this.sideNav = 'open';
  }
  @HostListener('window:scroll', [])
  toKnowHeight() {
    this.ScrollY = window.scrollY;
    if (window.scrollY <= 40) {
      this.onScroll = 'navbar-light ';
    } else if (window.scrollY > 40) {
      this.onScroll =
        ' opacity-75 bg-black  text-white navbar-dark position-fixed py-2 top-0 mt-0';
    }
  }
  search() {
    const data = {
      name: this.nameSearch,
    };
    this.StoresService.searchStore(data).subscribe((data: any) => {
      this.searched = data.allstores;
    });
  }
  removeStore(id: any) {
    this.StoresService.removeStore(id).subscribe((data: any) => {
      if (data.message == 'deleted') {
        this.searched = this.searched.filter((item: any) => item?._id != id);
        this.StoresService.storDeleted(data.deletedStore.createdBy).subscribe(
          (data) => {}
        );
        for (let i = 0; i < data.deletedStore.storeProduct.length; i++) {
          const element = data.deletedStore.storeProduct[i];
          this.ProductsService.deleteProductById(element.productId).subscribe(
            (data: any) => {}
          );
        }
      }
    });
  }
  logout() {
    localStorage.removeItem('userToken');
    this.router.navigate([`/login`]);
  }
}
