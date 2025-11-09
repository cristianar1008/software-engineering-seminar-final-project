import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  hidePassword = true;

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  submit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.loading = true;

  let { username, password } = this.form.value;
  const identificationNumber = Number(username);

  this.authService.login(identificationNumber, password!).subscribe({
    next: (res) => {
      this.loading = false;

      // res.user.role viene de tu backend
      const role = res.user.role;

      // Redirige según rol
      switch(role) {
        case 'ADMIN':
          this.router.navigate(['/admin']);
          break;
        case 'SECRETARIA':
          this.router.navigate(['/secretario/vehiculos']);
          break;
        case 'INSTRUCTOR':
          this.router.navigate(['/instructor']);
          break;
        case 'STUDENT':
          this.router.navigate(['/alumno']);
          break;
        default:
          // Por seguridad, si no reconoce el rol
          this.router.navigate(['/login']);
      }
    },
    error: (err) => {
      this.loading = false;
      console.error('Error en login:', err);
      alert('Usuario o contraseña incorrectos');
    }
  });
}

}
