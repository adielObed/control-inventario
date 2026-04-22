import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {
  private apiUrl = `${API_BASE_URL}/movimientos`;

  constructor(private http: HttpClient) {}

  crearMovimiento(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
