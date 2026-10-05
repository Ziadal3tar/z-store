import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { User } from 'src/app/core/models/user.model';

export interface AuthUserResponse {
  message?: string;
  user?: User;
  userData?: User;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  signUp(data: { userName: string; email: string; password: string }): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/signUp`, data);
  }

  login(data: { email: string; password: string }): Observable<{ token: string; id: string; message: string; user?: User }> {
    return this.http.post<{ token: string; id: string; message: string; user?: User }>(`${this.baseUrl}/logIn`, data);
  }

  getCurrentUser(): Observable<AuthUserResponse> {
    return this.http.get<AuthUserResponse>(`${this.baseUrl}/me`);
  }

  getAllUser(): Observable<any> {
    return this.http.get(`${this.baseUrl}/allUser`);
  }

  getAllAdmin(): Observable<any> {
    return this.http.get(`${this.baseUrl}/allAdmins`);
  }


  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/removeUser/${encodeURIComponent(id)}`);
  }

  updateUser(user: unknown, id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/updateUser/${encodeURIComponent(id)}`, user);
  }

  updateProfile(payload: Record<string, unknown>): Observable<AuthUserResponse> {
    return this.http.patch<AuthUserResponse>(`${this.baseUrl}/profile`, payload);
  }

  editProfilePic(formData: FormData): Observable<any> {
    return this.http.patch(`${this.baseUrl}/editProfilePic`, formData);
  }

  searchUser(data: { name: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/searchUser`, data);
  }

  addAdmin(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/addAdmin/${encodeURIComponent(id)}`, {});
  }

  block(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/block/${encodeURIComponent(id)}`, {});
  }
}
