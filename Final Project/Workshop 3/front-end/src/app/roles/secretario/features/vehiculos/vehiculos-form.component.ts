import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VehiculosService, Vehiculo, VehiculoCreate, VehiculoUpdate } from './vehiculos.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BreadcrumbsComponent } from 'src/app/shared/breadcrumbs.component';

@Component({
  selector: 'app-vehiculos-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule, MatDatepickerModule, MatNativeDateModule, MatSnackBarModule, BreadcrumbsComponent],
  template: `
    <app-breadcrumbs [segments]="breadcrumbs"></app-breadcrumbs>
    <mat-card>
      <mat-card-title>Secretary · {{ isEdit ? 'Edit' : 'New' }} Vehicle</mat-card-title>
      <mat-card-subtitle>Complete vehicle details</mat-card-subtitle>

      <form (ngSubmit)="guardar()" class="form-grid" novalidate>
        <mat-form-field appearance="outline">
          <mat-label>License Plate</mat-label>
          <input matInput [(ngModel)]="form.placa" name="placa" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Model (Year)</mat-label>
          <mat-select [(ngModel)]="form.modelo" name="modelo" required>
            <mat-option *ngFor="let y of years" [value]="y">{{ y }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Brand</mat-label>
          <mat-select [(ngModel)]="form.marca" name="marca" required>
            <mat-option *ngFor="let m of marcas" [value]="m">{{ m }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="form.estado" name="estado" required>
            <mat-option *ngFor="let e of estados" [value]="e">{{ e }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>License Type</mat-label>
          <mat-select [(ngModel)]="form.tipo_licencia" name="tipo_licencia" required>
            <mat-option *ngFor="let t of tiposLicencia" [value]="t">{{ t }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Registration Date</mat-label>
          <input matInput [matDatepicker]="pickerRegistro" [(ngModel)]="fechaRegistroDP" name="fecha_registro_dp" />
          <mat-datepicker-toggle matSuffix [for]="pickerRegistro"></mat-datepicker-toggle>
          <mat-datepicker #pickerRegistro></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Departure Date</mat-label>
          <input matInput [matDatepicker]="pickerSalida" [(ngModel)]="fechaSalidaDP" name="fecha_salida_dp" />
          <mat-datepicker-toggle matSuffix [for]="pickerSalida"></mat-datepicker-toggle>
          <mat-datepicker #pickerSalida></mat-datepicker>
        </mat-form-field>

        <div style="margin-top: 12px;">
          <button mat-raised-button color="primary" type="submit">{{ isEdit ? 'Update' : 'Create' }}</button>
          <a mat-stroked-button color="primary" routerLink="/secretario/vehiculos" style="margin-left: 8px;">Cancel</a>
        </div>
      </form>
    </mat-card>
  `,
})
export class VehiculosFormComponent implements OnInit {
  private service = inject(VehiculosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdRef = inject(ChangeDetectorRef);
  private snack = inject(MatSnackBar);

  isEdit = false;
  vehiculoId: number | null = null;
  fechaRegistroDP: Date | null = null;
  fechaSalidaDP: Date | null = null;
  form: VehiculoCreate | VehiculoUpdate = {
    placa: '',
    modelo: '',
    marca: '',
    estado: 'Good', // Changed default to match translated array
    tipo_licencia: 'B1',
    fecha_registro: '',
    fecha_salida: '',
  };

  // Listas de opciones
  currentYear = new Date().getFullYear();
  years: string[] = Array.from({ length: (this.currentYear - 1990 + 1) }, (_, i) => String(1990 + i)).reverse();
  marcas: string[] = [
    'Toyota','Chevrolet','Ford','Renault','Mazda','Nissan','Hyundai','Kia','Volkswagen','BMW','Mercedes-Benz','Audi','Peugeot','Citroën','Fiat','Jeep','Dodge','Subaru','Suzuki','SEAT','Skoda','Volvo','Land Rover','Mini','Mitsubishi','Honda','Porsche','Tesla','Ram','Chery','Great Wall','JAC','BYD','Foton','Isuzu','Cadillac','Chrysler'
  ];
  // Translated status options
  estados: string[] = ['Bad','Regular','Good','Excellent'];
  tiposLicencia: string[] = ['A1','A2','B1','B2','B3','C1','C2','C3'];
  breadcrumbs = [
    { label: 'Secretary', link: '/secretario/vehiculos' },
    { label: 'Vehicles', link: '/secretario/vehiculos' },
    { label: 'New' },
  ];

  // Simple grid styles for form
  static styles = `
    :host { display: block; }
    mat-card { margin: 16px 0 24px; }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      align-items: center;
    }
    .form-grid mat-form-field { width: 100%; }
    .form-grid input.mat-input-element,
    .form-grid input.mat-mdc-input-element { text-align: center; }
    .mat-mdc-select-value { justify-content: center !important; }
    .mat-mdc-option .mdc-list-item__primary-text { text-align: center; width: 100%; }
    mat-card-title, mat-card-subtitle { text-align: center; }
    @media (max-width: 700px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.vehiculoId = Number(idParam);
      this.breadcrumbs = [
        { label: 'Secretary', link: '/secretario/vehiculos' },
        { label: 'Vehicles', link: '/secretario/vehiculos' },
        { label: 'Edit' },
      ];
      this.service.getById(this.vehiculoId).subscribe({
        next: (v) => {
          this.form = {
            placa: v.placa,
            modelo: v.modelo,
            marca: v.marca,
            estado: v.estado, // Note: Ensure backend returns English or map it if necessary
            tipo_licencia: v.tipo_licencia,
            fecha_registro: v.fecha_registro,
            fecha_salida: v.fecha_salida,
          };
          if (v.fecha_salida) {
            const d = new Date(v.fecha_salida);
            this.fechaSalidaDP = isNaN(d.getTime()) ? null : d;
          }
          if (v.fecha_registro) {
            const r = new Date(v.fecha_registro);
            this.fechaRegistroDP = isNaN(r.getTime()) ? null : r;
          }
          // Fuerza la actualización visual en entorno zoneless
          this.cdRef.detectChanges();
        },
      error: (err) => this.snack.open(`Could not load vehicle: ${err?.error?.detail || err.message}`,'Close',{ duration: 5000 }),
      });
    }
  }

  guardar() {
    const errores = this.validarFormulario();
    if (errores.length > 0) {
      this.snack.open(errores.join('\n'), 'Close', { duration: 5000, panelClass: ['mat-elevation-z4'] });
      return;
    }
    if (this.isEdit && this.vehiculoId != null) {
      const payload: VehiculoUpdate = { ...this.form };
      // Normalización ligera
      payload.placa = (payload.placa ?? '').toString().trim().toUpperCase() || undefined;
      payload.modelo = (payload.modelo ?? '').toString().trim() || undefined;
      payload.marca = (payload.marca ?? '').toString().trim() || undefined;
      payload.estado = (payload.estado ?? '').toString().trim() || undefined;
      payload.tipo_licencia = (payload.tipo_licencia ?? '').toString().trim() || undefined;
      payload.fecha_registro = this.fechaRegistroDP ? this.toIsoOrUndefined(this.fechaRegistroDP) : this.toIsoOrUndefined(payload.fecha_registro);
      payload.fecha_salida = this.isEdit && this.fechaSalidaDP ? this.toIsoOrUndefined(this.fechaSalidaDP) : this.toIsoOrUndefined(payload.fecha_salida);
      this.service.update(this.vehiculoId, payload).subscribe({
        next: () => {
          this.service.refresh();
          this.router.navigate(['/secretario/vehiculos']);
        },
      error: (err) => this.snack.open(`Error updating: ${err?.error?.detail || err.message}`,'Close',{ duration: 5000 }),
      });
    } else {
      const payload: VehiculoCreate = {
        placa: (this.form.placa || '').toString().trim().toUpperCase(),
        modelo: (this.form.modelo || '').toString().trim(),
        marca: (this.form.marca || '').toString().trim(),
        estado: (this.form.estado || '').toString().trim(),
        tipo_licencia: (this.form.tipo_licencia || '').toString().trim(),
        fecha_registro: this.toIsoOrUndefined(this.fechaRegistroDP ?? this.form.fecha_registro),
        fecha_salida: this.toIsoOrUndefined(this.fechaSalidaDP ?? this.form.fecha_salida),
      };
      this.service.create(payload).subscribe({
        next: () => {
          this.service.refresh();
          this.router.navigate(['/secretario/vehiculos']);
        },
        error: (err) => this.snack.open(`Error creating: ${err?.error?.detail || err.message}`,'Close',{ duration: 5000 }),
      });
    }
  }

  private validarFormulario(): string[] {
    const msgs: string[] = [];
    // Placa: requerida y formato razonable (carro AAA123 o moto AAA12A)
    const placa = (this.form.placa || '').toString().trim().toUpperCase();
    if (!placa) {
      msgs.push('License Plate is required.');
    } else {
      const carro = /^[A-Z]{3}\d{3}$/;
      const moto = /^[A-Z]{3}\d{2}[A-Z]$/;
      const mixto = /^[A-Z0-9-]{5,8}$/; // fallback menos estricto
      if (!(carro.test(placa) || moto.test(placa) || mixto.test(placa))) {
        msgs.push('Invalid License Plate format (e.g., AAA123 or AAA12A).');
      }
      this.form.placa = placa;
    }

    // Modelo: requerido, año válido
    const yStr = (this.form.modelo || '').toString().trim();
    const y = Number(yStr);
    if (!yStr) {
      msgs.push('Model (Year) is required.');
    } else if (!Number.isFinite(y) || yStr.length !== 4) {
      msgs.push('Model must be a 4-digit year.');
    } else {
      const minY = 1990;
      const maxY = this.currentYear;
      if (y < minY || y > maxY) msgs.push(`Model must be between ${minY} and ${maxY}.`);
    }

    // Marca, estado, tipo licencia: requeridos y dentro de listas
    const marca = (this.form.marca || '').toString().trim();
    if (!marca) msgs.push('Brand is required.');
    else if (!this.marcas.includes(marca)) msgs.push('Selected brand is invalid.');

    const estado = (this.form.estado || '').toString().trim();
    if (!estado) msgs.push('Status is required.');
    else if (!this.estados.includes(estado)) msgs.push('Selected status is invalid.');

    const tipo = (this.form.tipo_licencia || '').toString().trim();
    if (!tipo) msgs.push('License Type is required.');
    else if (!this.tiposLicencia.includes(tipo)) msgs.push('Selected license type is invalid.');

    // Fechas: si existen, deben ser válidas; salida no antes de registro
    const regIso = this.toIsoOrUndefined(this.fechaRegistroDP ?? this.form.fecha_registro);
    const salIso = this.toIsoOrUndefined(this.fechaSalidaDP ?? this.form.fecha_salida);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (this.fechaRegistroDP || this.form.fecha_registro) {
      if (!regIso) msgs.push('Registration date has an invalid format.');
      else {
        const d = new Date(regIso);
        const d0 = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        if (d0.getTime() > today.getTime()) msgs.push('Registration date cannot be in the future.');
      }
    }
    if (this.fechaSalidaDP || this.form.fecha_salida) {
      if (!salIso) msgs.push('Departure date has an invalid format.');
      else if (regIso) {
        const r = new Date(regIso);
        const s = new Date(salIso);
        const r0 = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth(), r.getUTCDate()));
        const s0 = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()));
        if (s0.getTime() < r0.getTime()) msgs.push('Departure date cannot be before registration date.');
      }
    }

    return msgs;
  }

  private toIsoOrUndefined(value?: string | Date): string | undefined {
    if (!value) return undefined;
    if (value instanceof Date) {
      const d = value;
      return isNaN(d.getTime()) ? undefined : new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();
    }
    const raw = value.trim();
    // dd/MM/yyyy
    const parts = raw.split('/');
    if (parts.length === 3) {
      const [ddStr, mmStr, yyyyStr] = parts;
      const dd = Number(ddStr);
      const mm = Number(mmStr);
      const yyyy = Number(yyyyStr);
      if (Number.isFinite(dd) && Number.isFinite(mm) && Number.isFinite(yyyy) && dd >= 1 && mm >= 1 && mm <= 12) {
        const iso = new Date(Date.UTC(yyyy, mm - 1, dd));
        if (!isNaN(iso.getTime())) return iso.toISOString();
      }
    }
    // Fallback: ISO o yyyy-MM-dd
    const dashParts = raw.split('-');
    if (dashParts.length === 3 && dashParts[0].length === 4) {
      const iso = new Date(Date.UTC(Number(dashParts[0]), Number(dashParts[1]) - 1, Number(dashParts[2])));
      if (!isNaN(iso.getTime())) return iso.toISOString();
    }
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString();
    return undefined;
  }
}