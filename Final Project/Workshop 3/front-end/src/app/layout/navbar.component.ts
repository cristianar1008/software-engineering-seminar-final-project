import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar color="primary" class="navbar app-toolbar">
      <div class="brand">Drive Master</div>
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
      </nav>
    </mat-toolbar>
  `,
  styles: [
    `
      .navbar { position: sticky; top: 0; z-index: 1000; }
      .brand { font-weight: 600; letter-spacing: 0.3px; }
      .spacer { flex: 1 1 auto; }
      .nav-links a { margin-left: 6px; color: #fff; }
      .nav-links a .mat-icon { margin-right: 6px; }
      .nav-links a.active { background: rgba(255,255,255,0.14); }
    `,
  ],
})
export class NavbarComponent {}