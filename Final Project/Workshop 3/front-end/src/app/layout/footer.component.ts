// src/app/layout/footer.component.ts (AJUSTE XL)
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
selector: 'app-footer',
standalone: true,
imports: [CommonModule, MatIconModule, RouterModule],
changeDetection: ChangeDetectionStrategy.OnPush,
template: `
<footer class="app-footer mat-elevation-z2">
<div class="footer-grid">

<div class="footer-section brand-info">
<h3 class="brand-title">Drive Master</h3>
<p>Facilitando la gestión vehicular y la asignación de instructores para una experiencia de aprendizaje de conducción superior.</p>
</div>

<div class="footer-section">
<h4>Enlaces Rápidos</h4>
<ul>
<li><a routerLink="/terminos-condiciones">Términos y Condiciones</a></li>
<li><a routerLink="/politica-privacidad">Política de Privacidad</a></li>
<li><a routerLink="/mapa-sitio">Mapa del Sitio</a></li>
</ul>
</div>

<div class="footer-section">
<h4>Contacto</h4>
<p class="contact-item">
<mat-icon>email</mat-icon> 
<a href="mailto:soporte@drivemaster.com">soporte@drivemaster.com</a>
</p>
<p class="contact-item">
<mat-icon>phone</mat-icon> 
(55) 123-4567
</p>
<p class="contact-item">
<mat-icon>location_on</mat-icon> 
Calle Ejemplo 45, Bogotá, CO
</p>
</div>

</div>
<div class="footer-bottom-bar">
<div class="copyright">
&copy; {{ year }} Drive Master. Todos los derechos reservados.
</div>
</div>
</footer>
`,
styles: [`
.app-footer {
background-color: #f7f7f7;
color: #333;
padding: 30px 20px 15px;
margin-top: 40px;
border-top: 3px solid #1976d2;
box-sizing: border-box;
width: 100%;
}

.footer-grid {
display: grid;
grid-template-columns: 1fr 1fr 1fr; /* 3 columnas iguales por defecto (tablet/desktop) */
gap: 30px;
max-width: 1200px; /* Ancho máximo para el contenido */
margin: 0 auto;
padding-bottom: 30px;
}

.brand-title {
color: #1976d2;
font-size: 1.5em;
font-weight: 600;
margin-bottom: 10px;
}

.copyright {
font-size: 1em;
color: #666;
}

h4 {
font-size: 1.1em;
font-weight: 500;
color: #555;
margin-bottom: 15px;
border-bottom: 1px solid #ddd;
padding-bottom: 5px;
}

ul {
list-style: none;
padding: 0;
}

li a {
text-decoration: none;
color: #555;
display: block;
padding: 5px 0;
transition: color 0.3s;
}

li a:hover {
color: #1976d2;
}

.contact-item {
display: flex;
align-items: center;
margin-bottom: 10px;
font-size: 0.9em;
}

.contact-item mat-icon {
margin-right: 8px;
font-size: 18px;
height: 18px;
width: 18px;
color: #1976d2;
}

.contact-item a {
color: #555;
text-decoration: none;
}

.footer-bottom-bar {
text-align: center;
border-top: 1px solid #eee;
padding-top: 15px;
font-size: 0.8em;
color: #777;
}

/* ------------------------------------- */
/* MEDIA QUERY: Optimización para Móviles */
/* ------------------------------------- */
@media (max-width: 768px) {
.footer-grid {
grid-template-columns: 1fr; /* Una columna para el 100% del ancho */
gap: 20px;
padding: 0 10px;
}
.footer-section {
padding-bottom: 15px;
border-bottom: 1px solid #eee;
}
.brand-info {
border-bottom: none;
}
}

/* ------------------------------------- */
/* NUEVA MEDIA QUERY: Optimización para XL (Pantallas Grandes) */
/* ------------------------------------- */
@media (min-width: 1201px) {
.footer-grid {
max-width: 1400px; /* Expandimos un poco el contenido */
grid-template-columns: 2fr 1fr 1fr; /* 2 partes para Brand, 1 para Enlaces, 1 para Contacto */
}
}
`]
})
export class FooterComponent {
year = new Date().getFullYear();
}