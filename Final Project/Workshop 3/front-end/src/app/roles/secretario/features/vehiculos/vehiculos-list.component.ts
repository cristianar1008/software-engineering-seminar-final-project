import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VehiculosService, Vehiculo } from './vehiculos.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable, Subject, combineLatest, map, startWith } from 'rxjs';
import { DateFormatPipe } from '../../../../shared/date-format.pipe';
import { BreadcrumbsComponent } from '../../../../shared/breadcrumbs.component';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog.component';

@Component({
  selector: 'app-vehiculos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTableModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatDialogModule, MatSnackBarModule, DateFormatPipe, BreadcrumbsComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host { display: block; }
      mat-card { margin: 16px 0 24px; }
      .acciones { display: flex; gap: 8px; align-items: center; }
      td.mat-cell, th.mat-header-cell { vertical-align: middle; }
      .acciones-col { white-space: nowrap; }
    `
  ],
  template: `
    <app-breadcrumbs [segments]="breadcrumbs"></app-breadcrumbs>
    <mat-card>
      <mat-card-title>Secretario · Vehículos</mat-card-title>
      <mat-card-subtitle>Gestión de vehículos</mat-card-subtitle>
      <div style="margin: 8px 0; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <a mat-raised-button color="primary" routerLink="/secretario/vehiculos/nuevo">
          Nuevo vehículo
        </a>
        <span style="flex: 1 1 auto"></span>
        <mat-form-field appearance="outline" style="width: 100%; max-width: 360px;">
          <mat-label>Buscar</mat-label>
          <input matInput (input)="onSearchChange($event.target.value)" placeholder="Placa, marca, modelo" />
        </mat-form-field>
      </div>

      <table mat-table [dataSource]="(vehiculosFiltrados$ | async) ?? []" class="mat-elevation-z1" style="width: 100%;">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let v">{{ v.id }}</td>
        </ng-container>
        <ng-container matColumnDef="placa">
          <th mat-header-cell *matHeaderCellDef>Placa</th>
          <td mat-cell *matCellDef="let v">{{ v.placa }}</td>
        </ng-container>
        <ng-container matColumnDef="modelo">
          <th mat-header-cell *matHeaderCellDef>Modelo</th>
          <td mat-cell *matCellDef="let v">{{ v.modelo }}</td>
        </ng-container>
        <ng-container matColumnDef="marca">
          <th mat-header-cell *matHeaderCellDef>Marca</th>
          <td mat-cell *matCellDef="let v">{{ v.marca }}</td>
        </ng-container>
        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let v">{{ v.estado }}</td>
        </ng-container>
        <ng-container matColumnDef="tipo_licencia">
          <th mat-header-cell *matHeaderCellDef>Tipo Licencia</th>
          <td mat-cell *matCellDef="let v">{{ v.tipo_licencia }}</td>
        </ng-container>
        <ng-container matColumnDef="fecha_registro">
          <th mat-header-cell *matHeaderCellDef>Fecha Registro</th>
          <td mat-cell *matCellDef="let v">{{ v.fecha_registro | dateFormat }}</td>
        </ng-container>
        <ng-container matColumnDef="fecha_salida">
          <th mat-header-cell *matHeaderCellDef>Fecha Salida</th>
          <td mat-cell *matCellDef="let v">{{ v.fecha_salida | dateFormat }}</td>
        </ng-container>
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef class="acciones-col">Acciones</th>
          <td mat-cell *matCellDef="let v" class="acciones-col">
            <div class="acciones">
              <a mat-stroked-button color="primary" [routerLink]="['/secretario/vehiculos', v.id]">Editar</a>
              <button mat-stroked-button color="warn" (click)="eliminar(v.id)">Eliminar</button>
            </div>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <p *ngIf="((vehiculosFiltrados$ | async) ?? []).length === 0" style="margin-top: 12px;">No hay vehículos.</p>
    </mat-card>
  `,
})
export class VehiculosListComponent implements OnInit {
  private service = inject(VehiculosService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  vehiculos$: Observable<Vehiculo[]> = this.service.vehiculos$;
  breadcrumbs = [
    { label: 'Secretario', link: '/secretario/vehiculos' },
    { label: 'Vehículos' },
  ];
  private filtro$ = new Subject<string>();
  vehiculosFiltrados$: Observable<Vehiculo[]> = combineLatest([
    this.vehiculos$,
    this.filtro$.pipe(startWith('')),
  ]).pipe(
    map(([vehiculos, q]) => {
      const query = (q || '').trim().toLowerCase();
      if (!query) return vehiculos;
      return vehiculos.filter(v => {
        return (
          String(v.placa || '').toLowerCase().includes(query) ||
          String(v.marca || '').toLowerCase().includes(query) ||
          String(v.modelo || '').toLowerCase().includes(query)
        );
      });
    })
  );
  displayedColumns = ['id', 'placa', 'modelo', 'marca', 'estado', 'tipo_licencia', 'fecha_registro', 'fecha_salida', 'acciones'];

  constructor() {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.service.refresh();
  }

  onSearchChange(value: string) {
    this.filtro$.next(value);
  }

  eliminar(id: number) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar vehículo',
        message: `¿Eliminar vehículo #${id}?`,
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.service.remove(id).subscribe({
        next: () => {
          this.service.refresh();
          this.snack.open('Vehículo eliminado correctamente', 'Cerrar', { duration: 3000 });
        },
        error: (err) =>
          this.snack.open(`Error al eliminar: ${err?.error?.detail || err.message}`, 'Cerrar', {
            duration: 5000,
          }),
      });
    });
  }
}