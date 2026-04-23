import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface Material {
  _id: string;
  nombre: string;
  categoria: 'Eléctrico' | 'Mecánico';
  stock: number;
  alertaMinima: number;
  unidad: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private apiUrl = `${API_BASE_URL}/materiales`;

  constructor(private http: HttpClient) { }

  updateMaterial(id: string, material: Partial<Material>): Observable<Material> {
    return this.http.put<Material>(`${this.apiUrl}/${id}`, material);
  }

  getMateriales(categoria?: string): Observable<Material[]> {
    const url = categoria ? `${this.apiUrl}?categoria=${categoria}` : this.apiUrl;
    return this.http.get<Material[]>(url);
  }

  getBajoStock(): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.apiUrl}/bajo-stock`);
  }
}
