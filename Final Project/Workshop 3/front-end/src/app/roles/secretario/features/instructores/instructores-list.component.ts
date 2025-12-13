import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InstructoresService, StaffResponse } from './instructores.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Observable, Subject, combineLatest, map, startWith } from 'rxjs';
import { BreadcrumbsComponent } from '../../../../shared/breadcrumbs.component';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog.component';
import { DateFormatPipe } from '../../../../shared/date-format.pipe'; // Asumo que reutilizas tu pipe

@Component({
  selector: 'app-instructores-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTableModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatDialogModule, MatSnackBarModule, MatIconModule, BreadcrumbsComponent, ConfirmDialogComponent, DateFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    mat-card { margin: 16px 0 24px; }
    .acciones { display: flex; gap: 8px; align-items: center; }
    td.mat-cell, th.mat-header-cell { vertical-align: middle; }
    .acciones-col { white-space: nowrap; width: 150px; }
  `],
  template: `
    <app-breadcrumbs [segments]="breadcrumbs"></app-breadcrumbs>
    <mat-card>
      <mat-card-title>Secretario · Instructores (Staff)</mat-card-title>
      <mat-card-subtitle>Gestión de personal e instructores</mat-card-subtitle>
      
      <div style="margin: 8px 0; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <a mat-raised-button color="primary" routerLink="/secretario/instructores/nuevo">
          Nuevo Instructor
        </a>
        <span style="flex: 1 1 auto"></span>
        <mat-form-field appearance="outline" style="width: 100%; max-width: 360px;">
          <mat-label>Buscar</mat-label>
          <input matInput (input)="onSearchChange($event.target.value)" placeholder="Nombre, apellido o cargo" />
        </mat-form-field>
      </div>

      <table mat-table [dataSource]="(instructoresFiltrados$ | async) ?? []" class="mat-elevation-z1" style="width: 100%;">
        
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let s">{{ s.id }}</td>
        </ng-container>

        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>Nombre Completo</th>
          <td mat-cell *matCellDef="let s">{{ s.personFirstName }} {{ s.personLastName }}</td>
        </ng-container>

        <ng-container matColumnDef="cargo">
          <th mat-header-cell *matHeaderCellDef>Cargo / Tipo</th>
          <td mat-cell *matCellDef="let s">{{ s.typeStaffName }}</td>
        </ng-container>

        <ng-container matColumnDef="fecha_contrato">
          <th mat-header-cell *matHeaderCellDef>Fecha Contrato</th>
          <td mat-cell *matCellDef="let s">{{ s.hireDate | dateFormat }}</td>
        </ng-container>

        <ng-container matColumnDef="salario">
          <th mat-header-cell *matHeaderCellDef>Salario</th>
          <td mat-cell *matCellDef="let s">{{ s.salary | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
        </ng-container>

        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef class="acciones-col">Acciones</th>
          <td mat-cell *matCellDef="let s" class="acciones-col">
            <div class="acciones">
              <a mat-stroked-button color="primary" [routerLink]="['/secretario/instructores', s.id]">Editar</a>
              <button mat-icon-button color="warn" (click)="eliminar(s)" matTooltip="Eliminar">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <p *ngIf="((instructoresFiltrados$ | async) ?? []).length === 0" style="margin-top: 12px; text-align: center; color: #666;">
        No hay registros encontrados.
      </p>
    </mat-card>
  `,
})
export class InstructoresListComponent implements OnInit {
  private service = inject(InstructoresService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  instructores$ = this.service.instructores$;
  breadcrumbs = [
    { label: 'Secretario', link: '/secretario/instructores' },
    { label: 'Instructores' },
  ];

  private filtro$ = new Subject<string>();
  
  // Lógica de filtrado en cliente
  instructoresFiltrados$: Observable<StaffResponse[]> = combineLatest([
    this.instructores$,
    this.filtro$.pipe(startWith('')),
  ]).pipe(
    map(([lista, q]) => {
      const query = (q || '').trim().toLowerCase();
      if (!query) return lista;
      return lista.filter(s => 
        (s.personFirstName + ' ' + s.personLastName).toLowerCase().includes(query) ||
        (s.typeStaffName || '').toLowerCase().includes(query)
      );
    })
  );

  displayedColumns = ['id', 'nombre', 'cargo', 'fecha_contrato', 'salario', 'acciones'];

  ngOnInit(): void {
    this.service.refresh();
  }

  onSearchChange(val: any) {
    this.filtro$.next(val);
  }

  eliminar(staff: StaffResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Instructor',
        message: `¿Eliminar a ${staff.personFirstName} ${staff.personLastName} del staff?`,
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.service.remove(staff.id).subscribe({
          next: () => {
            this.service.refresh();
            this.snack.open('Instructor eliminado correctamente', 'Cerrar', { duration: 3000 });
          },
          error: (err) => this.snack.open('Error al eliminar: ' + (err.error?.error || err.message), 'Cerrar', { duration: 5000 })
        });
      }
    });
  }
}