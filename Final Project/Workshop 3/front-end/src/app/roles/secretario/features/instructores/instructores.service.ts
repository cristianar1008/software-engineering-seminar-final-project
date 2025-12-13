import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, switchMap, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';

// Datos para crear la Persona (UserController)
export interface RegisterRequest {
identificationTypeId: number;
  identificationNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Generalmente necesario para el registro de usuario
}

// Datos para crear el Staff (StaffController)
export interface StaffRequest {
  personId: number;
  typeStaffId: number;
  hireDate: string;
  salary: number;
}

// Respuesta combinada para la lista
export interface StaffResponse {
  id: number;
  personId: number;
  personFirstName: string;
  personLastName: string;
  typeStaffId: number;
  typeStaffName: string;
  hireDate: string;
  salary: number;
}

@Injectable({ providedIn: 'root' })
export class InstructoresService {
  private javaUrl = environment.javaApiUrl;
  private refreshSubject = new Subject<void>();

  instructores$ = this.refreshSubject.pipe(
    switchMap(() => this.getAll())
  );

  constructor(private http: HttpClient) {}

  refresh() {
    this.refreshSubject.next();
  }

  // --- STAFF ---
  getAll(): Observable<StaffResponse[]> {
    return this.http.get<StaffResponse[]>(`${this.javaUrl}/staff/all`);
  }

  getById(id: number): Observable<StaffResponse> {
    return this.http.get<StaffResponse>(`${this.javaUrl}/staff/${id}`);
  }

  // Este método solo crea la parte del contrato (requiere ID de persona existente)
  createStaffOnly(payload: StaffRequest): Observable<any> {
    return this.http.post(`${this.javaUrl}/staff/register`, payload);
  }

  updateStaff(id: number, payload: StaffRequest): Observable<any> {
    return this.http.put(`${this.javaUrl}/staff/update/${id}`, payload);
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${this.javaUrl}/staff/delete/${id}`);
  }

  // --- USER (PERSONA) ---
  // Registra la persona y devuelve la respuesta que contiene el ID
  registerUser(payload: RegisterRequest): Observable<any> {
    return this.http.post(`${this.javaUrl}/user/register`, payload);
  }
}