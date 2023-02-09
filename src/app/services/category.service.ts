import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  // private baseUrl = 'http://localhost:3000/category';
  private baseUrl = 'https://apis-z-store.vercel.app/category';

  constructor(private http: HttpClient) {}
  allCategory():any{
    return this.http.get(`${this.baseUrl}/allCategories`, {
      headers: {
        authorization: `Bearer__${localStorage.getItem("userToken")}`
      }
  });
  }
  addCategory(data:any):any{
    return this.http.post(`${this.baseUrl}/addCategory`,JSON.stringify(data), {
      headers: {
        authorization: `Bearer__${localStorage.getItem("userToken")}`
      }
  });
  }
  removeCategory(id:any):any{
    return this.http.delete(`${this.baseUrl}/removeCategory/${id}`, {
      headers: {
        authorization: `Bearer__${localStorage.getItem("userToken")}`
      }
  });
  }
  updateCategory(data:any,id:any):any{
    return this.http.put(`${this.baseUrl}/updateCategory/${id}`,JSON.stringify(data) ,{
      headers: {
        authorization: `Bearer__${localStorage.getItem("userToken")}`
      }
  });
  }
}