import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbSegment {
  label: string;
  link?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="breadcrumbs" aria-label="breadcrumb">
      <ng-container *ngFor="let s of segments; let i = index">
        <ng-container *ngIf="s.link; else plain">
          <a [routerLink]="s.link">{{ s.label }}</a>
        </ng-container>
        <ng-template #plain>
          <span class="current">{{ s.label }}</span>
        </ng-template>
        <span class="sep" *ngIf="i < segments.length - 1">›</span>
      </ng-container>
    </nav>
  `,
  styles: [
    `
      .breadcrumbs { font-size: 13px; color: #6b7280; margin-bottom: 8px; display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
      .breadcrumbs a { color: #1f6feb; text-decoration: none; }
      .breadcrumbs a:hover { text-decoration: underline; }
      .sep { opacity: 0.6; }
      .current { color: #1b1f24; }
    `,
  ],
})
export class BreadcrumbsComponent {
  @Input() segments: BreadcrumbSegment[] = [];
}