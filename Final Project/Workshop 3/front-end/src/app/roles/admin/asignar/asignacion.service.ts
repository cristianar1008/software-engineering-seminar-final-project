import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AsignacionService {
  private apiFast = environment.pythonApiUrl;
  private apiJava = environment.javaApiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /** 🔹 Helper: genera headers con el token */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  /** 🔹 Backend Java */
  obtenerEstudiantes(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiJava}/student/all`, { headers });
  }

  obtenerInstructores(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiJava}/staff/all`, { headers });
  }

  /** 🔹 FastAPI */
  obtenerVehiculos(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiFast}/vehiculos`, { headers });
  }

  obtenerCursos(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiFast}/academico/cursos`, { headers });
  }

  obtenerDisponibilidad(dia_semana: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiFast}/academico/disponibilidad?dia_semana=${dia_semana}`, { headers });
  }

  asignarClase(payload: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiFast}/academico/asignar-clase`, payload, { headers });
  }

  /** 🔹 Nuevos endpoints */
  obtenerClasesAsignadas(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiFast}/academico/asignaciones`, { headers });
  }

  actualizarClase(id: number, payload: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiFast}/academico/asignaciones/${id}`, payload, { headers });
  }
}
