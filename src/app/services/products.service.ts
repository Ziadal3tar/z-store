import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  // private baseUrl = 'https://z-store-apis-b6lh.vercel.app/Product';
  private baseUrl = 'https://z-store-apis-b6lh.vercel.app/Product';

  constructor(private http: HttpClient) {}

addproduct(
  formdata: FormData,
  categoryId: string
): any {
  return this.http.post(
    `${this.baseUrl}/addProduct/${categoryId}`,
    formdata,
    {
      headers: {
        authorization: `Bearer__${localStorage.getItem('userToken')}`,
      },
    }
  );
}



  removeproduct(productId: any): any {
    return this.http.post(
      `${this.baseUrl}/addProduct/${productId}`,

      {
        headers: {
          authorization: `Bearer__${localStorage.getItem('userToken')}`,
        },
      }
    );
  }
  getProduct() {
    return this.http.get(`${this.baseUrl}/allProducts`);
  }
  getSpecialOffers() {
    return this.http.get(`${this.baseUrl}/getSpecialProduct`);
  }

  getProductById(id: any) {
    return this.http.get(`${this.baseUrl}/getProduct/${id}`);
  }

  deleteProductById(id: any) {
    return this.http.delete(`${this.baseUrl}/deleteProductById/${id}`);
  }

  ifDeletedProduct(data: any) {
    return this.http.patch(`${this.baseUrl}/ifDeletedProduct`, data);
  }
  getStoresProducts(id: any) {
    return this.http.get(`${this.baseUrl}/getStoresProducts/${id}`);
  }
}
