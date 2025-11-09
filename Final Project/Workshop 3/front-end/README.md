# 🚀 Plataforma Web - Frontend (Angular)

## 🧩 Descripción
Este proyecto corresponde al **frontend** de la plataforma desarrollada en **Angular**, conectada a servicios **Java (Spring Boot)** y **Python (FastAPI)**.  
Permite la gestión de clases, instructores, estudiantes, vehículos y asignaciones académicas, además de la visualización y edición de datos en tiempo real.

---

## 📦 Requisitos previos
Antes de comenzar, asegúrate de tener instalado:

| Herramienta | Versión recomendada | Comando para verificar |
|--------------|--------------------|-------------------------|
| Node.js | v18 o superior | `node -v` |
| npm | v9 o superior | `npm -v` |
| Angular CLI | v17 o superior | `ng version` |

Si no tienes Angular CLI instalado:
```bash
npm install -g @angular/cli

Clonar repositorio
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio

⚙️ Instalar dependencias
npm install


🌍 Configurar variables de entorno
export const environment = {
  production: false,
  javaApiUrl: 'http://localhost:8083/api',
  pythonApiUrl: 'http://localhost:8000/api/v1'
};

Ejecutar el servidor de desarrollo
ng serve
http://localhost:4200/
ng build --configuration production
