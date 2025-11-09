import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from './layout/navbar.component';
import { FooterComponent } from './layout/footer.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('secretary-portal');
  constructor(private router: Router) {}

  isLoginRoute(): boolean {
    return this.router.url.startsWith('/login');
  }
}
