import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { EmailValidator } from '@angular/forms';
import jwt_decode from 'jwt-decode';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductsService } from './products.service';

@Injectable({
  providedIn: 'root',
})
export class UserService implements OnInit {
  allProduct: any = [];

  cart: any;

  // private baseUrl = 'https://z-store-apis-b6lh.vercel.app/auth';
  private baseUrl = 'https://z-store-apis-b6lh.vercel.app/auth';

  userData: any;

  cartlength: any;

  constructor(
    private http: HttpClient,
    private ProductsService: ProductsService
  ) {}

  ngOnInit(): void {}

  signUp(data: any): any {
    return this.http.post(`${this.baseUrl}/signUp`, data);
  }

  getAllUser(): Observable<any> {
    return this.http.get(`${this.baseUrl}/allUser`);
  }
  getAllAdmin(): Observable<any> {
    return this.http.get(`${this.baseUrl}/allAdmins`);
  }

  getUserData(token: any): any {
    return this.http.get(`${this.baseUrl}/getUser/${token}`);
  }

  getUserById(id: any): any {
    return this.http.get(`${this.baseUrl}/getUserById/${id}`);
  }

  deleteUser(id: any) {
    return this.http.delete(`${this.baseUrl}/removeUser/${id}`, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }

  updateUser(user: any, id: any): any {
    return this.http.put(`${this.baseUrl}/updateUser/${id}`, user);
  }

  login(user: any): any {
    return this.http.post(`${this.baseUrl}/logIn`, user);
  }

  addpic(img: any) {
    return this.http.post(`${this.baseUrl}/addProfilePic`, img);
  }

  // addToFavorites(product: any, token:any) {
  //   return this.http.patch(`${this.baseUrl}/addToFavorites/${token}`, product);
  // }

  // deleteFromCart(token:any, product:any) {
  //   return this.http.patch(`${this.baseUrl}/deleteFromCart/${token}`, product);
  // }

  deleteFromFavorites(token: any, product: any) {
    return this.http.patch(
      `${this.baseUrl}/deleteFromFavorites/${token}`,
      product
    );
  }

  saveAfterDrag(token: any, data: any) {
    return this.http.patch(`${this.baseUrl}/saveAfterDrag/${token}`, data);
  }

  updateProduct() {
    const token = localStorage.getItem('userToken');
    this.getUserData(token).subscribe((data: any) => {
      this.cart = data.userData.cart;
      for (let i = 0; i < this.cart.length; i++) {
        const element = this.cart[i];
        this.ProductsService.getProductById(element.productId).subscribe(
          (data: any) => {
            this.allProduct.push(data.product);
          }
        );
      }
    });
  }

  editProfilePic(formdata: any) {
    return this.http.patch(`${this.baseUrl}/editProfilePic`, formdata);
  }

  searchUser(data: any) {
    return this.http.post(`${this.baseUrl}/searchUser`, data, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }

  addAdmin(id: any) {
    return this.http.put(`${this.baseUrl}/addAdmin/${id}`, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }

  block(id: any) {
    return this.http.put(`${this.baseUrl}/block/${id}`, {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    });
  }
}
