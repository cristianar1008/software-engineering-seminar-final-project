import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, startWith, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Vehiculo {
  id: number;
  placa: string;
  modelo: string;
  marca: string;
  estado: string;
  fecha_registro?: string;
  tipo_licencia: string;
  fecha_salida?: string;
}

export interface VehiculoCreate {
  placa: string;
  modelo: string;
  marca: string;
  estado: string;
  tipo_licencia: string;
  fecha_registro?: string;
  fecha_salida?: string;
}

export interface VehiculoUpdate {
  placa?: string;
  modelo?: string;
  marca?: string;
  estado?: string;
  tipo_licencia?: string;
  fecha_registro?: string;
  fecha_salida?: string;
}

@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private baseUrl = environment.apiBaseUrl;
  private vehiculosPath = `${this.baseUrl}/vehiculos`;
  private refreshSubject = new Subject<void>();
  vehiculos$: Observable<Vehiculo[]> = this.refreshSubject.pipe(
    startWith(void 0),
    switchMap(() => this.http.get<Vehiculo[]>(this.vehiculosPath))
  );

  constructor(private http: HttpClient) {}

  getAll(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.vehiculosPath);
  }

  getById(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.vehiculosPath}/${id}`);
  }

  create(payload: VehiculoCreate): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.vehiculosPath, payload);
  }

  update(id: number, payload: VehiculoUpdate): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.vehiculosPath}/${id}`, payload);
  }

  remove(id: number): Observable<{ deleted: boolean; id: number }> {
    return this.http.delete<{ deleted: boolean; id: number }>(`${this.vehiculosPath}/${id}`);
  }

  refresh(): void {
    this.refreshSubject.next();
  }
}