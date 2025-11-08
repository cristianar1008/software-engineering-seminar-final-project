// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

interface AuthResponse {
  jwtToken: string;
  // Añade otros campos que Java devuelva (ej: id, username, roles)
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly apiUrl = environment.javaApiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  
  // Asume que Java requiere un objeto con 'username' y 'password'
  login(identificationNumber: number, password: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/auth/login`, {
    identificationNumber,
    password
  }).pipe(
    tap(response => {
      this.saveToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    })
  );
}


  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    // Implementación simple: verifica si el token existe
    // Una implementación más robusta debería verificar la expiración del JWT
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    // Redirigir al login
    this.router.navigate(['/login']); 
  }
}