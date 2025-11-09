import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-asignar',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-title>Secretario · Asignar</mat-card-title>
      <mat-card-subtitle>Asignación de vehículos e instructores</mat-card-subtitle>
      <p style="margin-top: 12px;">Módulo en construcción.</p>
    </mat-card>
  `,
})
export class AsignarComponent {}