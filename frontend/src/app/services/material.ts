import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Material {
  _id: string;
  nombre: string;
  categoria: 'Eléctrico' | 'Mecánico';
  stock_actual: number;
  stock_minimo: number;
  unidad_medida: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private apiUrl = 'http://localhost:3000/api/materiales';

  constructor(private http: HttpClient) {}

  getMateriales(categoria?: string): Observable<Material[]> {
    const url = categoria ? `${this.apiUrl}?categoria=${categoria}` : this.apiUrl;
    return this.http.get<Material[]>(url);
  }

  getBajoStock(): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.apiUrl}/bajo-stock`);
  }
}
