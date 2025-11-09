## Driver Master — Workshop 3

### Overview
- Workshop 3 packages the Angular frontend, Java backend, and Python backend.
- Includes a Postman collection and environment to exercise the APIs.
- This README consolidates setup and usage, with a detailed section for the Python backend.

### Structure
- `front-end/` — Angular app.
- `java-backend/` — Java API.
- `python-backend/` — FastAPI-based Python API.
- `DriverMaster.postman_collection.json` — Postman collection for the project.
- `Screenshots Unit Test Java/` and `Screenshots Unit Test Python/` — test result screenshots.

---

## Python Backend (FastAPI)

### Overview
- FastAPI-based REST API for health checks, vehicle management, and academic features (courses and schedules).
- Versioned API under `apiBase = /api/v1` for stability.
- Postman collection and environment provided for quick testing.

### Requirements
- `Python 3.11+` recommended (works on `Python 3.12`).
- Windows PowerShell (or similar) with virtual environment support.
- `pip` installed and up to date.

### Setup
- Navigate to: `Final Project/Workshop 3/python-backend`.
- Create and activate a virtual environment:
  - Create: `python -m venv .venv`
  - Activate (PowerShell): `\.\.venv\Scripts\Activate.ps1`
  - Upgrade pip: `python -m pip install --upgrade pip`
  - Install dependencies: `pip install -r requirements.txt`

### Run
- Start the server with Uvicorn:
  - `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`
- Default base URL: `http://localhost:8000`.
- Health check: open `http://localhost:8000/health`.

### Testing
- Run tests: `python -m pytest -q`
- Notes:
  - FastAPI `@app.on_event` startup/shutdown is deprecated; consider lifespan handlers.
  - `datetime.utcnow()` is deprecated; prefer `datetime.now(datetime.UTC)`.
- Test modules under `python-backend/test/`:
  - `test_root_health.py` — root and health.
  - `test_cors.py` — CORS headers.
  - `test_academico_models.py` — Course/Schedule models and interval utilities.
  - `test_vehicle_models.py` — Vehicle model.
  - `test_vehiculos_endpoints.py` — Vehicle endpoints with FakeDB and monkeypatch.

### Postman
- Collection: `Final Project/Workshop 3/python-backend/python backend.postman_collection.json`
- Environment: `Final Project/Workshop 3/python-backend/python backend.postman_environment.json`
- Variables:
  - `baseUrl = http://localhost:8000`
  - `apiBase = /api/v1`
  - Optional: `vehicleId`, `courseId`, `scheduleId`
- Usage:
  - Import the collection and environment, select the environment, and run requests with the server running.

### API Base and Versioning
- All endpoints are under `{{baseUrl}}{{apiBase}}/...`.
- Example: `GET {{baseUrl}}{{apiBase}}/vehiculos` → `GET http://localhost:8000/api/v1/vehiculos`.

### Endpoints

- Root
  - `GET /` — basic status and welcome message.

- Health
  - `GET /health` — service status (e.g., `{ "status": "ok" }`).

- Vehicles (`/api/v1/vehiculos`)
  - `GET /vehiculos` — list all vehicles.
  - `GET /vehiculos/{id}` — get vehicle by ID (`200` or `404`).
  - `POST /vehiculos` — create vehicle.
    - Example body:
      ```json
      {
        "placa": "ABC123",
        "marca": "Toyota",
        "modelo": "Corolla",
        "anio": 2020,
        "color": "Azul"
      }
      ```
    - Responses: `201 Created` with `id`, `400 Bad Request`, `409 Conflict`.
  - `PUT /vehiculos/{id}` — update fields (handles unique plate conflicts).
  - `DELETE /vehiculos/{id}` — delete vehicle (`200` with `{deleted: true}` or `404`).

- Academic (`/api/v1/academico`)
  - `GET /academico/cursos` — list courses.
  - `POST /academico/cursos` — create course (see collection examples for payload).
  - `GET /academico/horarios` — list schedules.
  - `POST /academico/horarios` — create schedule linked to a course.

### Common Errors and Fixes
- `ECONNREFUSED` in Postman:
  - Ensure server is running: `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`.
  - Confirm `{{baseUrl}} = http://localhost:8000` and `{{apiBase}} = /api/v1`.
  - Test `GET /health` first.
- `404 Not Found` for vehicles by ID:
  - Create a vehicle via `POST /vehiculos` and reuse its returned `id`.

### Commands to run individual test files
- Activate venv (PowerShell): `\.\.venv\Scripts\Activate.ps1`
- Per file:
  - `python -m pytest -q test/test_root_health.py`
  - `python -m pytest -q test/test_cors.py`
  - `python -m pytest -q test/test_academico_models.py`
  - `python -m pytest -q test/test_vehicle_models.py`
  - `python -m pytest -q test/test_vehiculos_endpoints.py`

This repository contains the **backend developed in Java with Spring Boot**, responsible for providing a secure and scalable **REST API** that communicates with a **MySQL** database.  

The application implements authentication using **JWT (JSON Web Token)**, user management, and modules for students and administrative staff.  

It also includes **unit tests with JUnit 5 and Mockito**, along with the **database SQL script**.  

The project additionally features a **Python backend built with FastAPI**, which handles the **core business logic**, and an **Angular frontend** that delivers a **dynamic and interactive web interface** for end users.


---

## Backend Auth Java Spring Boot

The backend implements a **modular architecture** with controllers, services, and repositories, allowing secure CRUD operations.  
It features **JWT-based authentication** and **role validation** to protect the endpoints.  

### Includes functionalities for:
- User registration and management  
- Student and staff administration  
- Security with Spring Security and JWT tokens  
- Automated unit testing  
- MySQL database connection using JPA  

---

## Technologies Used

| Component | Technology |
|------------|-------------|
| Language | Java 17 |
| Main Framework | Spring Boot 3 |
| Security | Spring Security + JWT |
| Database | MySQL |
| ORM | Spring Data JPA |
| Testing | JUnit 5 and Mockito |
| Build Tool | Maven |

---

## Prerequisites

Before running the application, make sure you have installed:

- **Java 17** or higher  
- **Maven 3.9+**  
- **MySQL** running locally or remotely  
- **IntelliJ IDEA** or any IDE compatible with Spring Boot  
- **Postman** (optional, for testing the endpoints)

---


## Installation and Execution

### 1️ Clone the repository
```bash
git clone [https://github.com/tu-usuario/driver-master-backend.git](https://github.com/cristianar1008/software-engineering-seminar-final-project.git)
cd Final Project/Workshop 3
```

### 2. Configure the MySQL database
1. Create a MySQL database called `DriverMaster`.
2. In the `application.properties` or `application.yml` file, update the
3. credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/DriverMaster
   spring.datasource.username=tu_usuario
   spring.datasource.password=tu_contraseña
   spring.jpa.hibernate.ddl-auto=update
   ```
---

### 3️ Compile the project
```bash
mvn clean install
```

### 4️ Run the application
Run the main class:
```bash
AuthBackendApplication
```

Or from the terminal:
```bash
mvn spring-boot:run
```

The application will be available at:
```
http://localhost:8083
```

---

##  Unit Tests

The **unit tests** are located in the following directory:
```
src/test/java/
```

Para ejecutarlas:
```bash
mvn test
```

---

## Database Script

The project includes an SQL script with the MySQL database structure required for the application.

It must be run before the system starts for the first time.

---

## Endpoints Principales

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/user/register` | Register a new user |
| GET | `/api/user/all` | Get all users |
| PUT | `/api/user/update/{id}` | Update a user |
| DELETE | `/api/user/delete/{id}` | Delete a user |
| POST | `/api/staff/register` | Register administrative staff |
| POST | `/api/student/register` | Register a student |

---

## Autors

**Developed by:** Cristian Parra
**Language:** Java 17
**Framework:** Spring Boot 3
**Database:** MySQL

---


