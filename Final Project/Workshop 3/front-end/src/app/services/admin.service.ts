// src/app/services/admin.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.javaApiUrl; // http://localhost:8083/api

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  // CRUD Admin
  getAllAdmins(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/all`, { headers: this.getHeaders() });
  }

  getAdminById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/${id}`, { headers: this.getHeaders() });
  }

  registerAdmin(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/register`, data, { headers: this.getHeaders() });
  }

  updateAdmin(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/update/${id}`, data, { headers: this.getHeaders() });
  }

  deleteAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/delete/${id}`, { headers: this.getHeaders() });
  }
}
