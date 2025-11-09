// src/app/services/admin-panel.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminPanelService { // Renombrado de AdminService
  private http = inject(HttpClient);
  private apiUrl = environment.javaApiUrl; // http://localhost:8083/api

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }
  
  // --- Funciones de utilidad para los diferentes endpoints ---
  
  // Devuelve la ruta base para un tipo de entidad
  private getEntityUrl(entityType: 'admin' | 'user' | 'student' | 'staff'): string {
    return `${this.apiUrl}/${entityType}`;
  }

  // Devuelve un Observable con la lista de entidades
  getAll(entityType: 'admin' | 'user' | 'student' | 'staff'): Observable<any> {
    const url = this.getEntityUrl(entityType);
    return this.http.get(`${url}/all`, { headers: this.getHeaders() });
  }

  // Elimina una entidad por ID
  delete(entityType: 'admin' | 'user' | 'student' | 'staff', id: number): Observable<any> {
    const url = this.getEntityUrl(entityType);
    return this.http.delete(`${url}/delete/${id}`, { headers: this.getHeaders() });
  }
  
  // *Opcional: puedes añadir register, getById, update de forma genérica o mantener los específicos si tienen lógica distinta.*
  // Por ahora, solo mantendremos getAll y delete para enfocarnos en la tabla y el panel.
  
  // Los métodos CRUD Admin originales (los mantengo por si hay dependencia externa)
  // Recomiendo usar los métodos genéricos 'getAll' y 'delete' con el parámetro 'admin'
  
  getAllAdmins(): Observable<any> {
    return this.getAll('admin');
  }

  deleteAdmin(id: number): Observable<any> {
    return this.delete('admin', id);
  }
  
  // ... (otros métodos CRUD Admin: getAdminById, registerAdmin, updateAdmin)
  
}