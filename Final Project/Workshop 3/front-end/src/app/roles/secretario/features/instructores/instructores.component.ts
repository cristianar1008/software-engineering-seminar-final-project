import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-instructores',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-title>Secretario · Instructores</mat-card-title>
      <mat-card-subtitle>Gestión de instructores</mat-card-subtitle>
      <p style="margin-top: 12px;">Módulo en construcción.</p>
    </mat-card>
  `,
})
export class InstructoresComponent {}