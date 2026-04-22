import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {
  private apiUrl = 'http://localhost:3000/api/movimientos';

  constructor(private http: HttpClient) {}

  crearMovimiento(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
