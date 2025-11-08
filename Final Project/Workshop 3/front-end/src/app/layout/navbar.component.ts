// src/app/components/navbar/navbar.component.ts (AJUSTE DE ANCHO)
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<mat-toolbar color="primary" class="navbar app-toolbar">
   <div class="brand">
     <a routerLink="/admin" class="brand-link">
        <div class="brand">
<!--           <mat-icon class="brand-icon">drive_eta</mat-icon>  -->
                    <img src="assets/logo.png" alt="Logo" class="logo"/> 
        </div>
      </a></div>
   <span class="spacer"></span>
   <nav class="nav-links">

     <a mat-button routerLink="/secretario/vehiculos" routerLinkActive="active">
       <mat-icon>directions_car</mat-icon>
       <span>Vehículos</span>
     </a>
     <a mat-button routerLink="/secretario/instructores" routerLinkActive="active">
       <mat-icon>school</mat-icon>
       <span>Instructores</span>
     </a>
        <a mat-button routerLink="/secretario/asignar" routerLinkActive="active">
          <mat-icon>assignment_ind</mat-icon>
          <span>Asignar</span>
        </a>

        <button mat-flat-button color="accent" (click)="logout()">
          <mat-icon>exit_to_app</mat-icon>
          <span>Cerrar Sesión</span>
        </button>
      </nav>
    </mat-toolbar>
  `,
  styles: [`
    .navbar { 
        position: sticky; 
        top: 0; 
        z-index: 1000; 
        padding: 0;/* REDUCIDO */
    }
    .brand-link {
        text-decoration: none; /* Quitar subrayado del enlace */
        color: white; /* Asegurar color blanco */
        cursor: pointer;
    }
    .logo{
     height:var(--mat-toolbar-standard-height, 64px);
      margin-top:-10%;
      width: auto;
    }
    .brand { 
        font-weight: 700; 
        font-size: .7em;
        display: flex;
        align-items: center;
    }
    .brand-icon {
        margin-right: 8px;
    }
    .spacer { 
        flex: 1 1 auto; 
    }
    .nav-links a, .nav-links button { 
        color: #fff;
        text-transform: uppercase;
        font-size: 0.5em;
    }
    .nav-links a.active { 
        background: rgba(255,255,255,0.2);
        border-radius: 4px;
    }
    .nav-links button[color="accent"] {
        background-color: #ff5722;
        color: white; 
        transition: background-color 0.3s;
    }
    .nav-links button[color="accent"]:hover {
        background-color: #e64a19; 
    }
`]
})
export class NavbarComponent {
  private authService = inject(AuthService);

  logout(): void {
    if (confirm('¿Estás seguro de que quieres cerrar la sesión?')) {
      this.authService.logout();
    }
  }
}