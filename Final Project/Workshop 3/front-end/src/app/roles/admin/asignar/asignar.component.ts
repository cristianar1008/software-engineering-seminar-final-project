import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { AsignacionService } from './asignacion.service';

@Component({
  selector: 'app-asignar',
  standalone: true,
  templateUrl: './asignar.component.html',
  styleUrls: ['./asignar.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTableModule
  ]
})
export class AsignarComponent implements OnInit {
  asignacionForm!: FormGroup;
  estudiantes: any[] = [];
  instructores: any[] = [];
  vehiculos: any[] = [];
  cursos: any[] = [];
  clasesAsignadas: any[] = [];
  displayedColumns = ['curso', 'instructor', 'estudiantes', 'hora', 'acciones'];

  horariosDisponibles: string[] = [];
  tipoClase: string = '';

  // flags para template y evitar ExpressionChangedAfter...
  datosCargados = false;
  clasesCargadas = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private asignacionService: AsignacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.asignacionForm = this.fb.group({
      cursoId: ['', Validators.required],
      tipoClase: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      instructorId: ['', Validators.required],
      estudianteIds: [[], Validators.required],
      vehiculoId: ['']
    });

    // Cargo datos necesarios en paralelo y luego las clases
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales() {
    forkJoin({
      estudiantes: this.asignacionService.obtenerEstudiantes(),
      instructores: this.asignacionService.obtenerInstructores(),
      vehiculos: this.asignacionService.obtenerVehiculos(),
      cursos: this.asignacionService.obtenerCursos()
    }).subscribe({
      next: ({ estudiantes, instructores, vehiculos, cursos }) => {
        this.estudiantes = estudiantes || [];
        this.instructores = instructores || [];
        this.vehiculos = vehiculos || [];
        this.cursos = cursos || [];
        // marcamos cargado y detect changes fuera de ciclo para evitar NG0100
        setTimeout(() => {
          this.datosCargados = true;
          this.cdr.detectChanges();
          // ahora que ya tenemos lista de estudiantes/instructores podemos cargar clases asignadas
          this.cargarClasesAsignadas();
        }, 0);
      },
      error: (err) => {
        console.error('Error cargando datos iniciales', err);
        this.snackBar.open('Error al cargar datos iniciales', 'Cerrar');
      }
    });
  }

  cargarClasesAsignadas() {
    this.asignacionService.obtenerClasesAsignadas().subscribe({
      next: (res) => {
        // normalizar cada registro para la UI
        const normalized = (res || []).map((c: any) => this.normalizeClase(c));
        // aseguramos asignación fuera del ciclo de detección inmediato
        setTimeout(() => {
          this.clasesAsignadas = normalized;
          this.clasesCargadas = true;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => {
        console.error('Error cargando clases asignadas', err);
        this.snackBar.open('Error al cargar clases asignadas', 'Cerrar');
      }
    });
  }

  private normalizeClase(clase: any) {
    // backend puede devolver estudiante_id (single) o estudiantes_ids (array)
    const estudiantes_ids = Array.isArray(clase.estudiantes_ids)
      ? clase.estudiantes_ids
      : (clase.estudiante_id ? [clase.estudiante_id] : []);

    // buscar nombres por id (si ya tenemos estudiantes cargados)
    const estudiantes_nombres = estudiantes_ids.map((id: number) => {
      const found = this.estudiantes.find(e => e.id === id) || this.estudiantes.find(e => e.personId === id);
      if (found) {
        // diversidad de campos entre Java y tu front
        return (found.firstName || found.personFirstName || found.name || '').trim();
      }
      return `#${id}`;
    });

    // profesor nombre
    const profesor = this.instructores.find(i => i.id === clase.profesor_id) || this.instructores.find(i => i.personId === clase.profesor_id);
    const profesor_nombre = profesor ? ((profesor.personFirstName || profesor.firstName || '') + ' ' + (profesor.personLastName || profesor.lastName || '')).trim() : `#${clase.profesor_id}`;

    // conservar curso_nombre o buscarlo
    const curso_nombre = clase.curso_nombre || (this.cursos.find(c => c.id === clase.curso_id)?.nombre || `#${clase.curso_id}`);

    return {
      ...clase,
      estudiantes_ids,
      estudiantes_nombres,
      profesor_nombre,
      curso_nombre
    };
  }

  onTipoClaseChange(tipo: string) {
    this.tipoClase = tipo;

    // Limitar número de estudiantes si es práctica
    const estudiantesCtrl = this.asignacionForm.get('estudianteIds');
    if (tipo === 'practica') {
      const current = estudiantesCtrl?.value || [];
      estudiantesCtrl?.setValue(current.length ? [current[0]] : []);
    }
    estudiantesCtrl?.setValidators([Validators.required]);
    estudiantesCtrl?.updateValueAndValidity();

    const vehiculoCtrl = this.asignacionForm.get('vehiculoId');
    if (tipo === 'teorica') {
      vehiculoCtrl?.clearValidators();
      vehiculoCtrl?.reset();
    } else {
      vehiculoCtrl?.setValidators([Validators.required]);
    }
    vehiculoCtrl?.updateValueAndValidity();
  }

  buscarDisponibilidad() {
    const fecha = this.asignacionForm.get('fecha')?.value;
    if (!fecha) return;

    const diaSemana = new Date(fecha).getDay();
    this.asignacionService.obtenerDisponibilidad(diaSemana).subscribe({
      next: (res) => {
        this.horariosDisponibles = (res || [])
          .filter((b: any) => b.disponible)
          .map((b: any) => `${b.inicio} - ${b.fin}`);
        // si estás editando y la hora actual no está en la lista, la añadimos para poder visualizarla
        const currentHora = this.asignacionForm.get('hora')?.value;
        if (currentHora && !this.horariosDisponibles.includes(currentHora)) {
          this.horariosDisponibles.unshift(currentHora);
        }
        this.cdr.detectChanges();
      },
      error: () => this.snackBar.open('Error al obtener disponibilidad', 'Cerrar')
    });
  }

  asignarClase() {
    if (this.asignacionForm.invalid) {
      this.snackBar.open('Por favor completa todos los campos', 'Cerrar');
      return;
    }

    const data = this.asignacionForm.value;
    const [hora_inicio, hora_fin] = data.hora.split(' - ');

    const payload = {
      tipo: data.tipoClase,
      curso_id: data.cursoId,
      profesor_id: data.instructorId,
      estudiantes_ids: data.estudianteIds,
      vehiculo_id: data.tipoClase === 'practica' ? data.vehiculoId : NoneIfEmpty(data.vehiculoId),
      dia_semana: new Date(data.fecha).getDay(),
      hora_inicio,
      hora_fin
    };

    this.asignacionService.asignarClase(payload).subscribe({
      next: () => {
        this.snackBar.open('Clase asignada correctamente', 'Cerrar', { duration: 3000 });
        this.asignacionForm.reset();
        // recargar
        this.cargarClasesAsignadas();
      },
      error: (err) => {
        const msg = err?.error?.detail || 'Error al asignar clase';
        this.snackBar.open(msg, 'Cerrar');
      }
    });
  }

  editarClase(clase: any) {
    // clase ya normalizada
    const fecha = this.convertirDiaSemanaAFecha(clase.dia_semana);

    // asegurarnos de que estudiantes_ids exista como array
    const estudiantes_ids = clase.estudiantes_ids ?? (clase.estudiante_id ? [clase.estudiante_id] : []);

    // Si la hora no está en horariosDisponibles, la añadimos temporalmente
    const horaStr = `${clase.hora_inicio} - ${clase.hora_fin}`;
    if (!this.horariosDisponibles.includes(horaStr)) {
      this.horariosDisponibles.unshift(horaStr);
    }

    // Patchear formulario
    this.asignacionForm.patchValue({
      cursoId: clase.curso_id,
      tipoClase: clase.tipo,
      fecha,
      instructorId: clase.profesor_id,
      estudianteIds: estudiantes_ids,
      hora: horaStr,
      vehiculoId: clase.vehiculo_id ?? ''
    });

    // Forzar la lógica de tipo para que muestre/oculte vehiculo y valide estudiantes
    // usamos setTimeout para que patchValue termine y no provoque ExpressionChanged
    setTimeout(() => {
      this.onTipoClaseChange(clase.tipo);
      this.cdr.detectChanges();
    }, 0);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private convertirDiaSemanaAFecha(dia: number): Date {
    const hoy = new Date();
    const diferencia = dia - hoy.getDay();
    const nuevaFecha = new Date(hoy);
    nuevaFecha.setDate(hoy.getDate() + diferencia);
    // conservar horas/minutos en 00:00 para el datepicker
    nuevaFecha.setHours(0, 0, 0, 0);
    return nuevaFecha;
  }
}

/** Helper para evitar enviar '' como vehiculo_id */
function NoneIfEmpty(v: any) {
  if (v === '' || v === null || v === undefined) return null;
  return v;
}
