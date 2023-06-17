import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class WishListService {
  // private baseUrl = 'http://localhost:3000/wishlist';
  private baseUrl = 'apis-z-store.vercel.app/wishlist';

  constructor(private http:HttpClient) { }
  addToFavorites(productId: any) {
    return this.http.put(`${this.baseUrl}/addWishList`, productId,{
      headers: {
        authorization:`Bearer__${localStorage.getItem("userToken")}`
      }
  });
  }
  removeToFavorites(productId: any) {
    return this.http.delete(`${this.baseUrl}/removeWishList/${productId}`,
    {
      headers: {
        authorization: `Bearer__${localStorage.getItem("userToken")}`
      }
  })

}
}
