import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api.config';

export interface Material {
  _id?: string;
  codigo?: string;
  nombre: string;
  categoria: string;
  stock: number;
  unidad: string;
  alertaMinima: number;
}

export interface Categoria {
  _id?: string;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private api = `${API_BASE_URL}/inventario`;

  constructor(private http: HttpClient) {}

  // Materiales
  getMateriales() {
    return this.http.get<Material[]>(`${this.api}/materiales`);
  }
  crearMaterial(data: any) {
    return this.http.post(`${this.api}/materiales`, data);
  }
  actualizarMaterial(id: string, data: any) {
    return this.http.put(`${this.api}/materiales/${id}`, data);
  }
  eliminarMaterial(id: string) {
    return this.http.delete(`${this.api}/materiales/${id}`);
  }

  // Categorías
  getCategorias() {
    return this.http.get<Categoria[]>(`${this.api}/categorias`);
  }
  crearCategoria(data: any) {
    return this.http.post(`${this.api}/categorias`, data);
  }
  eliminarCategoria(id: string) {
    return this.http.delete(`${this.api}/categorias/${id}`);
  }

  // Movimientos
  getMovimientos() {
    return this.http.get<any[]>(`${this.api}/movimientos`);
  }
  registrarMovimiento(data: { materialId: string; tipo: string; cantidad: number; motivo: string; usuario: string }) {
    return this.http.post(`${this.api}/movimientos`, data);
  }
}
