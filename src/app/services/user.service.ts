import { getAuthToken } from 'src/app/core/auth-token.util';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductsService } from './products.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  allProduct: any = [];

  cart: any;

  private baseUrl = `${environment.apiUrl}/auth`;

  userData: any;

  cartlength: any;

  constructor(
    private http: HttpClient,
    private ProductsService: ProductsService
  ) {}


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
        authorization: `Bearer__${getAuthToken()}`,
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
    const token = getAuthToken();
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
        authorization: `Bearer__${getAuthToken()}`,
      },
    });
  }

  addAdmin(id: any) {
    return this.http.put(`${this.baseUrl}/addAdmin/${id}`, {});
  }

  block(id: any) {
    return this.http.put(`${this.baseUrl}/block/${id}`, {});
  }
}
