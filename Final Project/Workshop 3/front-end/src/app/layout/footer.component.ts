import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="app-footer">
      <div class="footer-content">
        <span>© {{ year }} Drive Master</span>
        <span class="sep">•</span>
        <span>Seminar Project</span>
      </div>
    </footer>
  `,
  styles: [
    `
      .app-footer {
        margin-top: 24px;
        padding: 16px;
        border-top: 1px solid rgba(0,0,0,0.08);
        color: rgba(0,0,0,0.6);
      }
      .footer-content { display: flex; gap: 8px; align-items: center; }
      .sep { opacity: 0.5; }
    `,
  ],
})
export class FooterComponent {
  year = new Date().getFullYear();
}