import { CartService } from './../../services/cart.service';
import { WishListService } from './../../services/wish-list.service';
import { SharedService } from './../../services/shared.service';
import { UserService } from './../../services/user.service';
import { Options, LabelType } from 'ng5-slider';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ProductsService } from '../../services/products.service';
import { Component, OnInit } from '@angular/core';
import { LoginFirstComponent } from '../login-first/login-first.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-allproduct',
  templateUrl: './allproduct.component.html',
  styleUrls: ['./allproduct.component.css'],
})
export class AllproductComponent implements OnInit {
  cartlength: any;

  index: any;

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




allProducts: any[] = [];
filteredProducts: any[] = [];
products: any[] = [];
searchTerm = '';

currentPage = 1;
pageSize = 12;
totalPages = 0;
  constructor(

    private SharedService: SharedService,
    private CartService: CartService,
    private WishListService: WishListService
  ) { }

  ngOnInit(): void {

    this.SharedService.currentUserData.subscribe((data => {
      this.userData = data


    }))
    this.SharedService.currentAllProduct.subscribe((data: any) => {
      this.allProducts = data;
  this.applyFilters();
      // this.totalPages = Math.ceil(this.allProducts.length / this.pageSize);
    //    this.filteredProducts = [...this.allProducts];
    // this.updatePagination();
    })
  }
onFilterChange(filtered: any[]) {
  this.filteredProducts = [...filtered];
  this.currentPage = 1;
  this.updatePagination();
}

/* 🔹 Search result */
onSearchChange(term: string) {
  this.searchTerm = term.toLowerCase();
  this.applyFilters();
}
applyFilters() {
  let result = [...this.allProducts];

  if (this.searchTerm) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(this.searchTerm)
    );
  }

  this.filteredProducts = result;
  this.currentPage = 1;
  this.updatePagination();
}

onProductsChange(filtered: any[]) {
  this.filteredProducts = [...filtered];
  this.currentPage = 1;
  this.updatePagination();
}

updatePagination() {
  this.totalPages = Math.ceil(
    this.filteredProducts.length / this.pageSize
  );

  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;

  this.products = this.filteredProducts.slice(start, end);
}


  get paginationPages(): (number | string)[] {
    const pages: (number | string)[] = [];

    if (this.totalPages <= 7) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (this.currentPage > 4) {
      pages.push('...');
    }

    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(this.totalPages - 1, this.currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (this.currentPage < this.totalPages - 3) {
      pages.push('...');
    }

    pages.push(this.totalPages);

    return pages;
  }
goToPage(page: any) {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
    this.updatePagination();
  }
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
  trackById(index: number, item: any) {
    return item._id;
  }
  openDetails(product: any) {
    this.productDetails = product;
    this.openProductDetails = true;
  }

}
