import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InstructoresService, StaffRequest, RegisterRequest } from './instructores.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { BreadcrumbsComponent } from 'src/app/shared/breadcrumbs.component';
import { switchMap, finalize, tap } from 'rxjs/operators'; // Importante: tap para depurar

@Component({
  selector: 'app-instructores-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, 
    MatFormFieldModule, MatInputModule, MatSelectModule, 
    MatButtonModule, MatCardModule, MatDatepickerModule, 
    MatNativeDateModule, MatSnackBarModule, MatDividerModule,
    BreadcrumbsComponent
  ],
  template: `
    <app-breadcrumbs [segments]="breadcrumbs"></app-breadcrumbs>
    <mat-card>
      <mat-card-title>Secretary · {{ isEdit ? 'Edit Contract' : 'New Instructor' }}</mat-card-title>
      <mat-card-subtitle>{{ isEdit ? 'Modify working conditions' : 'Register personal and employment data' }}</mat-card-subtitle>

      <form (ngSubmit)="guardar()" class="form-grid" novalidate>
        
        <ng-container *ngIf="!isEdit">
          <div class="full-width-header">
            <h3>Personal Information</h3>
            <mat-divider></mat-divider>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>ID Type</mat-label>
            <mat-select [(ngModel)]="personForm.identificationTypeId" name="identificationType" required>
              <mat-option [value]="1">Citizenship Card</mat-option>
              <mat-option [value]="2">Identity Card</mat-option>
              <mat-option [value]="3">Foreigner ID</mat-option>
              <mat-option [value]="4">Passport</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>ID Number</mat-label>
            <input matInput type="number" [(ngModel)]="personForm.identificationNumber" name="identification" required />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>First Name</mat-label>
            <input matInput [(ngModel)]="personForm.firstName" name="firstName" required />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Last Name</mat-label>
            <input matInput [(ngModel)]="personForm.lastName" name="lastName" required />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" [(ngModel)]="personForm.email" name="email" required />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" [(ngModel)]="personForm.password" name="password" required />
          </mat-form-field>
        </ng-container>

        <div *ngIf="isEdit" class="full-width-header" style="margin-bottom: 16px;">
          <strong>Employee:</strong> {{ displayPersonName }}
        </div>

        <div class="full-width-header" [style.marginTop]="!isEdit ? '16px' : '0'">
          <h3>Contract Details</h3>
          <mat-divider></mat-divider>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Role / Staff Type</mat-label>
          <mat-select [(ngModel)]="staffForm.typeStaffId" name="typeStaffId" required>
            <mat-option [value]="1">Instructor</mat-option>
            <mat-option [value]="2">Administrative</mat-option>
            <mat-option [value]="3">Secretary</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Salary (COP)</mat-label>
          <input matInput type="number" [(ngModel)]="staffForm.salary" name="salary" required />
          <span matPrefix>$&nbsp;</span>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Hire Date</mat-label>
          <input matInput [matDatepicker]="picker" [(ngModel)]="hireDateDP" name="hireDate" required />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <div class="actions full-width-header">
          <button mat-raised-button color="primary" type="submit" [disabled]="loading">
            <span *ngIf="!loading">{{ isEdit ? 'Update' : 'Register Instructor' }}</span>
            <span *ngIf="loading">Saving...</span>
          </button>
           <a mat-stroked-button color="primary" routerLink="/secretario/instructores" style="margin-left: 8px;">Cancel</a>
        </div>

      </form>
    </mat-card>
  `,
  styles: [`
    :host { display: block; }
    mat-card { margin: 16px 0 24px; padding: 16px; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .full-width-header { grid-column: 1 / -1; }
    mat-form-field { width: 100%; }
    h3 { margin-bottom: 8px; color: #3f51b5; }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class InstructoresFormComponent implements OnInit {
  private service = inject(InstructoresService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  isEdit = false;
  staffId: number | null = null;
  loading = false;
  displayPersonName = '';
  hireDateDP: Date | null = null;

  // Modelo inicial de Persona
  personForm: RegisterRequest = {
    identificationTypeId: 1, 
    identificationNumber: 0,
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  // Modelo inicial de Staff
  staffForm: Partial<StaffRequest> = {
    typeStaffId: 1,
    salary: 0
  };

  breadcrumbs = [
    { label: 'Secretary', link: '/secretario/instructores' },
    { label: 'Instructors', link: '/secretario/instructores' },
    { label: 'New' },
  ];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.staffId = Number(idParam);
      this.breadcrumbs[2].label = 'Edit';
      this.cargarDatos(this.staffId);
    }
  }

  cargarDatos(id: number) {
    this.service.getById(id).subscribe({
      next: (data) => {
        this.staffForm.typeStaffId = data.typeStaffId;
        this.staffForm.salary = data.salary;
        this.staffForm.personId = data.personId;
        this.displayPersonName = `${data.personFirstName} ${data.personLastName}`;
        if (data.hireDate) {
           this.hireDateDP = new Date(data.hireDate);
        }
      },
      error: (e) => this.snack.open('Error loading instructor', 'Close', { duration: 3000 })
    });
  }

  guardar() {
    if (this.loading) return; 
    this.loading = true;
    console.log('--- INICIO GUARDADO ---');
    
    const hireDateStr = this.formatDate(this.hireDateDP || new Date());

    if (this.isEdit && this.staffId) {
      // --- MODO EDICIÓN ---
      const payload: StaffRequest = {
        personId: this.staffForm.personId!,
        typeStaffId: this.staffForm.typeStaffId!,
        salary: this.staffForm.salary!,
        hireDate: hireDateStr
      };

      this.service.updateStaff(this.staffId, payload)
        .pipe(finalize(() => {
            this.loading = false;
            console.log('--- FIN (Edición) ---');
        }))
        .subscribe({
          next: () => this.finalizar('Instructor updated successfully'),
          error: (e) => this.manejarError(e)
        });

    } else {
      // --- MODO CREACIÓN (User + Staff) ---
      console.log('1. Enviando datos de usuario:', this.personForm);
      const userPayload: RegisterRequest = { ...this.personForm };

      this.service.registerUser(userPayload).pipe(
        // TAP: Ver qué responde el backend exactamente
        tap(resp => console.log('2. Respuesta Backend User:', resp)),
        
        switchMap((respUser) => {
          // Lógica robusta para encontrar el ID
          let newPersonId: number | undefined;

          if (respUser && respUser.user && respUser.user.id) {
             newPersonId = respUser.user.id;
          } else if (respUser && respUser.id) {
             newPersonId = respUser.id;
          } else if (typeof respUser === 'number') {
             newPersonId = respUser; // Si devuelve solo el ID plano
          }

          console.log('3. ID detectado para Staff:', newPersonId);
          
          if (!newPersonId) {
             console.error('ESTRUCTURA RECIBIDA:', respUser);
             throw new Error("Could not find user ID in server response. Check console.");
          }

          const staffPayload: StaffRequest = {
            personId: newPersonId,
            typeStaffId: this.staffForm.typeStaffId!,
            salary: this.staffForm.salary!,
            hireDate: hireDateStr
          };
          
          console.log('4. Enviando datos de Staff:', staffPayload);
          return this.service.createStaffOnly(staffPayload);
        }),
        finalize(() => {
            this.loading = false;
            console.log('--- FIN (Creación) ---');
        }) 
      ).subscribe({
        next: (respStaff) => {
            console.log('5. Éxito final:', respStaff);
            this.finalizar('Instructor registered successfully');
        },
        error: (e) => this.manejarError(e)
      });
    }
  }

  private finalizar(msg: string) {
    this.snack.open(msg, 'Close', { duration: 3000 });
    // Resetear formulario para evitar problemas visuales si la redirección falla
    this.personForm = { identificationTypeId: 1, identificationNumber: 0, firstName: '', lastName: '', email: '', password: '' };
    this.service.refresh();
    this.router.navigate(['/secretario/instructores']);
  }

  private manejarError(err: any) {
    console.error('❌ ERROR CAPTURADO:', err);
    this.loading = false;
    const msg = err.error?.error || err.error?.message || err.message || 'Unknown error';
    this.snack.open(`Error: ${msg}`, 'Close', { duration: 5000 });
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  }
}