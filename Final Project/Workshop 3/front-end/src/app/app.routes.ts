import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'secretario/vehiculos',
    loadComponent: () => import('./roles/secretario/features/vehiculos').then(m => m.VehiculosListComponent)
  },
  {
    path: 'secretario/vehiculos/nuevo',
    loadComponent: () => import('./roles/secretario/features/vehiculos').then(m => m.VehiculosFormComponent)
  },
  {
    path: 'secretario/vehiculos/:id',
    loadComponent: () => import('./roles/secretario/features/vehiculos').then(m => m.VehiculosFormComponent)
  },
  {
    path: 'secretario/instructores',
    loadComponent: () => import('./roles/secretario/features/instructores').then(m => m.InstructoresComponent)
  },
  {
    path: 'secretario/asignar',
    loadComponent: () => import('./roles/secretario/features/asignar').then(m => m.AsignarComponent)
  },
  {
    path: 'administrador/asignar',
    loadComponent: () => import('./roles/admin/asignar/asignar.component').then(m => m.AsignarComponent)
  },
  // Vistas independientes por rol, sin dependencias cruzadas
  {
    path: 'instructor',
    loadComponent: () => import('./roles/instructor').then(m => m.InstructorHomeComponent)
  },
  {
    path: 'alumno',
    loadComponent: () => import('./roles/alumno').then(m => m.AlumnoHomeComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./roles/admin').then(m => m.AdminHomeComponent)
  },
];
