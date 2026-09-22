import { getAuthToken } from 'src/app/core/auth-token.util';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
export interface ProductListResponse {
  message: string;
  products: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private baseUrl = `${environment.apiUrl}/Product`;

  constructor(private http: HttpClient) { }

  addproduct(
    formdata: FormData,
    categoryId: string
  ): any {
    return this.http.post(
      `${this.baseUrl}/addProduct/${categoryId}`,
      formdata,
      {
        headers: {
          authorization: `Bearer__${getAuthToken()}`,
        },
      }
    );
  }



  removeproduct(productId: any): any {
    return this.http.post(
      `${this.baseUrl}/addProduct/${productId}`,

      {
        headers: {
          authorization: `Bearer__${getAuthToken()}`,
        },
      }
    );
  }
  getProduct(
  page = 1,
  limit = 12,
  search = ''
) {
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
  };

  const query = search.trim();

  if (query) {
    params['q'] = query;
  }

  return this.http.get<ProductListResponse>(
    `${this.baseUrl}/allProducts`,
    {
      params,
    }
  );
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
