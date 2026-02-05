import { CartService } from './../../services/cart.service';
import { WishListService } from './../../services/wish-list.service';
import { Component, HostListener, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  cartlength: any;

  nextCustomerClasses = '';

  backCustomerClasses = '';

  owlClass: any;

  feedbaclClass: any = 'd-none';

  feedBackButtonClass: any = 'btn btn-light text-danger';

  allUser = [];

  userData: any;

  specialOffers: any = [];
  loginFirst:any = false
  productDetails: any;
  openProductDetails = false;
  filter = {
    gender: '',
    category: '',
  };

  constructor(
    private ProductsService: ProductsService,
    private SharedService: SharedService,
    private WishListService: WishListService,
    private CartService: CartService
  ) {}

  ngOnInit(): void {

    this.SharedService.currentUserData.subscribe((data: any) => {
      this.userData = data;
      // this.SharedService.emit('updateSocketId', data._id);
      // this.deleteDeletedProd();
    });
    this.getSpecialOffers();
  }

  btn(id: any) {
    let btn = <HTMLInputElement>document.getElementById(id);
    btn.innerHTML = `<button data-aos="flip-down" data-aos-duration="1000" class="px-0 text-white btn bg-transparent border-bottom rounded-0">SHOP NOW</button>`;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.scrollY === 72) {
    }
  }

  addFeedback() {
    if (this.owlClass === undefined) {
      this.owlClass = 'd-none';
      this.feedbaclClass = undefined;
      this.feedBackButtonClass = 'btn btn-danger text-light';
    } else if (this.owlClass != undefined) {
      this.owlClass = undefined;
      this.feedbaclClass = 'd-none';
      this.feedBackButtonClass = 'btn btn-light text-danger';
    }
  }

  getSpecialOffers() {
    this.ProductsService.getSpecialOffers().subscribe((data: any) => {
      this.specialOffers = data.products;
    });
  }
  activeNavFilter(event: any) {
    let id = event.target.id;
    for (let i = 0; i < 7; i++) {
      (<HTMLInputElement>document.getElementById(`myLi${i}`))?.classList.remove(
        'activeNavFilter'
      );
    }
    (<HTMLInputElement>document.getElementById(id))?.classList.add(
      'activeNavFilter'
    );
  }

  ifInWishlist(item: any): any {
    for (let i = 0; i < this.userData?.wishlist?.length; i++) {
      const element = this.userData.wishlist[i];
      if (element._id == item._id) {
        return true;
      }
    }
    return false;
  }
  addToFavorites(id: any, event: any) {
    if (this.userData == undefined) {
      this.loginFirst = true
return
    }
    let data = {
      productId: id,
    };
    for (let i = 0; i < this.userData?.wishlist?.length; i++) {
      const element = this.userData.wishlist[i];
      if (element._id == id) {
        this.WishListService.removeToFavorites(data.productId).subscribe(
          (data: any) => {
            if (data.message == 'Done') {
              event.target.classList.remove('bi-heart-fill', 'text-danger');
              event.target.classList.add('bi-heart');
              return;
            }
          }
        );
      }
    }
    this.WishListService.addToFavorites(data).subscribe((data: any) => {
      if (data.message == 'Done') {
        event.target.classList.add('bi-heart-fill', 'text-danger');
        event.target.classList.remove('bi-heart');
        this.SharedService.updateUserData();
      }
    });
  }
  deleteDeletedProd() {

    for (let i = 0; i < this.userData?.cartId?.products.length; i++) {
      const element = this.userData?.cartId?.products[i];

      if (element.productId == null) {
        const product = {
          productId: element._id,
          userId: this.userData._id,
        };

        this.CartService.removeFromCart(product).subscribe((data: any) => {
          if (data.message == 'removeProduct') {
            this.SharedService.updateUserData();
          }
        });
      }
    }
  }


}
