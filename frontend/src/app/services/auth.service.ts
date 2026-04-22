import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  register(data: { nombre: string; email: string; password: string }) {
    return this.http.post(`${this.api}`, data);
  }

  updateUser(id: string, data: { nombre: string; email: string }): Observable<any> {
    return this.http.put(`${this.api}/${id}`, data);
  }

  getUser(id: string): Observable<any> {
    return this.http.get(`${this.api}/${id}`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  login(data: { email: string; password: string }) {
    return this.http.post<{ token: string; user: any }>(`${this.api}/login`, data);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  /** Decodifica el JWT y retorna el payload (id, email, iat, exp) */
  getTokenPayload(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}
