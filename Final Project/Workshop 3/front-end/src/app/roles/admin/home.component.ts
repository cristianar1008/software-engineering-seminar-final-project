import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-title>Administrador · Inicio</mat-card-title>
      <mat-card-subtitle>Vista en construcción</mat-card-subtitle>
      <p style="margin-top: 12px;">Esta vista es independiente y no incluye módulos de otros roles.</p>
    </mat-card>
  `,
})
export class AdminHomeComponent {}