// admin/home.component.ts (FINAL)
import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { AdminPanelService } from 'src/app/services/admin-panel.service';

type EntityType = 'admin' | 'user' | 'student' | 'staff';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatTabsModule, MatTableModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="admin-panel-card">
      <mat-card-title><mat-icon color="primary">settings</mat-icon> Panel de Administración</mat-card-title>
      <mat-card-subtitle>Gestión de entidades: **{{ activeEntityType | titlecase }}**</mat-card-subtitle>

      <!-- Pestañas de Navegación -->
      <mat-tab-group 
        (selectedTabChange)="onTabChange($event.index)" 
        [selectedIndex]="entityTypes.indexOf(activeEntityType)"
        style="margin-top: 16px;">
        
        <mat-tab label="Administradores"></mat-tab>
        <mat-tab label="Usuarios"></mat-tab>
        <mat-tab label="Estudiantes"></mat-tab>
        <mat-tab label="Personal"></mat-tab>

      </mat-tab-group>

      <div class="controls-container">
        <button mat-raised-button color="primary" (click)="loadEntities()">
          <mat-icon>refresh</mat-icon> Cargar {{ activeEntityType | titlecase }}
        </button>
      </div>

      <!-- TABLA DE VISUALIZACIÓN DE ENTIDADES -->
      <!-- Se envuelve la tabla en un contenedor con scroll y altura fija -->
      <div *ngIf="entities.length > 0" class="table-container mat-elevation-z2">
        <table mat-table [dataSource]="entities">

          <!-- Columna ID -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef> ID </th>
            <td mat-cell *matCellDef="let element" class="p-4"> {{ element.id }} </td>
          </ng-container>

          <!-- Columna Nombre -->
          <ng-container matColumnDef="firstName">
            <th mat-header-cell *matHeaderCellDef> Nombre </th>
            <td mat-cell *matCellDef="let element" class="p-4"> 
              {{ getEntityName(element, 'first') }} 
            </td>
          </ng-container>

          <!-- Columna Apellido -->
          <ng-container matColumnDef="lastName">
            <th mat-header-cell *matHeaderCellDef> Apellido </th>
            <td mat-cell *matCellDef="let element" class="p-4"> 
              {{ getEntityName(element, 'last') }} 
            </td>
          </ng-container>
          
          <!-- Columna Específica (varía según la entidad) -->
          <ng-container matColumnDef="specificDetail">
            <th mat-header-cell *matHeaderCellDef> {{ getSpecificHeader() }} </th>
            <td mat-cell *matCellDef="let element" class="p-4"> 
              {{ getSpecificDetail(element) }} 
            </td>
          </ng-container>

          <!-- Columna Creado en -->
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef> Creado en </th>
            <td mat-cell *matCellDef="let element" class="p-4"> {{ element.createdAt | date:'short' }} </td>
          </ng-container>

          <!-- Columna Acciones -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Acciones </th>
            <td mat-cell *matCellDef="let element" class="p-4 action-buttons">
              
              <!-- 1. Botón Detalle (Genérico para todas las entidades) -->
              <button 
                mat-icon-button 
                color="primary" 
                title="Ver Detalles y Progreso"
                (click)="showDetails(element)">
                <mat-icon>info</mat-icon>
              </button>
              
              <!-- 2. Botón Suscripción/Pago (Solo para Estudiantes) -->
              <button 
                *ngIf="activeEntityType === 'student'"
                mat-icon-button 
                color="accent" 
                title="Gestionar Suscripciones/Pagos (Simulación)"
                (click)="manageSubscription(element)">
                <mat-icon>payment</mat-icon>
              </button>
              
              <!-- Botón Eliminar -->
              <button 
                mat-icon-button 
                color="warn" 
                title="Eliminar Entidad"
                (click)="deleteEntity(element.id, getEntityName(element, 'first'))">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
      
      <p *ngIf="entities.length === 0" class="no-data-message">No hay **{{ activeEntityType }}s** para mostrar.</p>
      
    </mat-card>
  `,
  styles: [`
    /* 1. Estilos para la Tarjeta Contenedora */
    .admin-panel-card {
      min-height: 90vh;
      display: flex;
      flex-direction: column;
      padding: 30px; /* Aumentar el padding de la tarjeta */
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Sombra suave para la tarjeta */
    }

    /* 2. Estilos para los Títulos: Centrado y Sombra */
    mat-card-title {
      text-align: center;
      font-size: 2em;
      font-weight: 600;
      color: #333;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1); /* Sombra sutil */
      margin-bottom: 8px; /* Espacio debajo del título principal */
    }

    mat-card-subtitle {
      text-align: center;
      color: #6a6a6a;
      font-style: italic;
      margin-bottom: 24px;
    }

    /* 3. Estilos para la Tabla: Colores Pastel y No Tan Plana */
    .table-container {
      flex-grow: 1;
      overflow-y: auto;
      max-height: calc(90vh - 250px); 
      border-radius: 8px; /* Bordes redondeados para la tabla */
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Sombra para darle profundidad */
      margin-top: 20px;
    }

    table {
      width: 100%;
      border-collapse: separate; /* Necesario para el border-spacing/radius */
      border-spacing: 0;
    }

    /* Encabezados de Columna (th) - Pastel más fuerte */
    th.mat-header-cell {
      background-color: #e0f7fa; /* Azul/Cian Pastel */
      color: #00796b; /* Texto oscuro para contraste */
      font-weight: 700;
      text-transform: uppercase;
      padding: 1rem 1rem; /* Padding interno */
      position: sticky; /* Mantener encabezados visibles al hacer scroll */
      top: 0;
      z-index: 10; /* Asegurar que esté encima de las filas */
    }

    /* Filas Pares (zebra-striping) - Pastel muy suave */
    tr.mat-row:nth-child(even) {
      background-color: #fce4ec; /* Rosa Pastel muy claro */
    }
    
    /* Filas Impares (zebra-striping) */
    tr.mat-row:nth-child(odd) {
      background-color: #ffffff; /* Blanco */
    }

    /* Hover en filas */
    tr.mat-row:hover {
      background-color: #fff8e1; /* Amarillo/Crema Pastel al pasar el ratón */
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    /* Celdas de Datos (td) */
    td.mat-cell {
        padding: 1rem;
        border-bottom: 1px solid #f0f0f0; /* Línea divisoria suave */
    }

    .action-buttons {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .no-data-message {
        margin-top: 20px; 
        font-style: italic; 
        color: #777;
        text-align: center; /* Centrar el mensaje sin datos */
    }
  `]
})
export class AdminHomeComponent implements OnInit {
  private adminPanelService = inject(AdminPanelService);
  private cdr = inject(ChangeDetectorRef);
  
  entities: any[] = []; 
  entityTypes: EntityType[] = ['admin', 'user', 'student', 'staff'];
  activeEntityType: EntityType = 'admin';
  
  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'specificDetail', 'createdAt', 'actions'];

  ngOnInit() {
    // Carga las entidades del tipo 'admin' por defecto al inicio
    this.loadEntities(); 
  }

  // --- Métodos de Acción para los nuevos botones ---

  /**
   * Muestra los detalles de la entidad. Este será el punto de entrada
   * para tu futuro componente de perfil/detalle.
   */
  showDetails(entity: any) {
    console.log(`[ACCIÓN FUTURA] Navegar a detalles de ${this.activeEntityType}:`, entity);
    // Aquí iría la navegación a tu componente de perfil, por ejemplo:
    // this.router.navigate(['/admin', this.activeEntityType, entity.id, 'details']);
    
    // Muestra un mensaje de prueba para ver el progreso
    if (this.activeEntityType === 'student') {
        alert(`Detalles del Estudiante: ${this.getEntityName(entity, 'first')}. ¡Aquí verás niveles de progreso y más!`);
    } else {
        alert(`Detalles de ${this.activeEntityType}: ${this.getEntityName(entity, 'first')}.`);
    }
  }

  /**
   * Muestra la gestión de suscripciones/pagos (solo Estudiantes).
   * Este es el ejemplo de datos quemados que solicitaste.
   */
  manageSubscription(student: any) {
    console.log('[ACCIÓN FUTURA] Gestionar Suscripción del Estudiante:', student);
    
    // Ejemplo de datos "quemados" para simular un futuro módulo de pagos.
    const mockPaymentStatus = {
        lastPayment: '2025-10-20',
        dueDate: '2025-11-20',
        status: 'Activo / Pendiente de renovación',
        nextAction: 'Pagar cuota de Diciembre ($500.000 COP)'
    };
    
    alert(`
        --- Gestión de Pagos para ${this.getEntityName(student, 'first')} ---
        Último Pago: ${mockPaymentStatus.lastPayment}
        Próximo Vencimiento: ${mockPaymentStatus.dueDate}
        Estado Actual: ${mockPaymentStatus.status}
        Acción Recomendada: ${mockPaymentStatus.nextAction}
        
        (Este es un módulo futuro de gestión de pagos)
    `);
  }

  // --- Métodos de Ayuda para la Tabla Dinámica (Sin Cambios en la lógica) ---

  getEntityName(entity: any, type: 'first' | 'last'): string {
    const key = type === 'first' ? 'FirstName' : 'LastName';
    
    if (this.activeEntityType === 'admin' || this.activeEntityType === 'staff') {
      return entity[`person${key}`];
    }
    return entity[type + key.substring(5)];
  }
  
  getSpecificHeader(): string {
    switch (this.activeEntityType) {
      case 'admin':
        return 'ID de Persona';
      case 'user':
        return 'Email / Cédula';
      case 'student':
        return 'Nivel / Email';
      case 'staff':
        return 'Tipo de Personal';
      default:
        return 'Detalle';
    }
  }

  getSpecificDetail(entity: any): string {
    switch (this.activeEntityType) {
      case 'admin':
        return entity.personId;
      case 'user':
        return `${entity.email} / ${entity.identificationNumber}`;
      case 'student':
        return `${entity.gradeLevel} / ${entity.email}`;
      case 'staff':
        return entity.typeStaffName;
      default:
        return '';
    }
  }
  
  // --- Lógica de Carga y Eliminación (Sin Cambios) ---

 loadEntities() {
    this.adminPanelService.getAll(this.activeEntityType).subscribe({
      next: (res) => {
        this.entities = Array.isArray(res) ? res : [res];
        console.log(`Entidades cargadas para ${this.activeEntityType}:`, res);
        
        // CORRECCIÓN: Forzar la detección de cambios para que la vista se actualice
        // dado que usamos ChangeDetectionStrategy.OnPush.
        this.cdr.markForCheck(); 
      },
      error: (err) => {
        console.error(`Error al cargar ${this.activeEntityType}s`, err);
        this.entities = [];
        this.cdr.markForCheck(); // También forzar para mostrar el mensaje de error/sin datos
      },
    });
  }

  

  onTabChange(index: number) {
    this.activeEntityType = this.entityTypes[index];
    this.loadEntities();
  }

  deleteEntity(id: number, name: string) {
    if (!confirm(`¿Eliminar a ${name} (${this.activeEntityType})?`)) return;
    
    this.adminPanelService.delete(this.activeEntityType, id).subscribe({
      next: () => {
        this.entities = this.entities.filter(e => e.id !== id);
      },
      error: (err) => console.error(`Error al eliminar ${this.activeEntityType}`, err),
    });
  }
}