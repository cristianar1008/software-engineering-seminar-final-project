# Python Backend (FastAPI)

## Overview
- FastAPI-based REST API that exposes health checks, vehicle management, and academic features (courses and schedules).
- Uses versioned routes under `apiBase` to keep the API stable: `apiBase = /api/v1`.
- Comes with a Postman collection and environment for quick testing.

## Requirements
- `Python 3.11+` recommended (works on `Python 3.12`).
- Windows PowerShell (or any shell) with virtual environment support.
- `pip` installed and up to date.

## Setup
- Navigate to the backend directory: `Final Project/Workshop 3/python-backend`.
- Create and activate a virtual environment:
  - Create: `python -m venv .venv`
  - Activate (PowerShell): `.\.venv\Scripts\Activate.ps1`
  - Upgrade pip: `python -m pip install --upgrade pip`
  - Install dependencies: `pip install -r requirements.txt`

## Run
- Start the server with Uvicorn:
  - `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`
- Default base URL for clients and Postman: `http://localhost:8000`.
- Quick health check: open `http://localhost:8000/health`.

## Testing
- Run tests: `python -m pytest -q`
- Notes:
  - The project currently uses FastAPI `on_event` startup/shutdown hooks; these are deprecated. Consider migrating to lifespan handlers.
  - `datetime.utcnow()` is deprecated; use `datetime.now(datetime.UTC)` for UTC time when updating the code.
 - Test suite is now split into modules under `test/` for clarity:
   - `test_root_health.py` (root and health)
   - `test_cors.py` (CORS headers)
   - `test_academico_models.py` (Course/Schedule models and time interval utils)
   - `test_vehicle_models.py` (Vehicle model)
   - `test_vehiculos_endpoints.py` (Vehicles endpoints using a FakeDB and monkeypatch)

## Postman
- Collection file: `Final Project/Workshop 3/python-backend/python backend.postman_collection.json`
- Environment file: `Final Project/Workshop 3/python-backend/python backend.postman_environment.json`
- Variables:
  - `baseUrl = http://localhost:8000`
  - `apiBase = /api/v1`
  - Optional helpers: `vehicleId`, `courseId`, `scheduleId` (can be set dynamically in tests)
- Usage:
  - Import both the collection and the environment.
  - Select the environment and run requests. Ensure the backend is running.

## API Base and Versioning
- All endpoints are exposed under `{{baseUrl}}{{apiBase}}/...`.
- Example: Vehicles list is `GET {{baseUrl}}{{apiBase}}/vehiculos` -> `GET http://localhost:8000/api/v1/vehiculos`.

## Endpoints

### Root
- `GET /`
- Returns a welcome message to verify the server is up.

### Health
- `GET /health`
- Returns service status (e.g., `{ "status": "ok" }`).

### Vehicles (`/api/v1/vehiculos`)
- `GET /vehiculos`
  - Description: List all vehicles.
  - Responses:
    - `200 OK`: Array of vehicles.

- `GET /vehiculos/{id}`
  - Description: Retrieve a vehicle by its ID.
  - Responses:
    - `200 OK`: Vehicle object.
    - `404 Not Found`: Vehicle does not exist.

- `POST /vehiculos`
  - Description: Create a new vehicle.
  - Request body (example JSON):
    ```json
    {
      "placa": "ABC123",
      "marca": "Toyota",
      "modelo": "Corolla",
      "anio": 2020,
      "color": "Azul"
    }
    ```
  - Responses:
    - `201 Created`: Returns the created vehicle with its `id`.
    - `400 Bad Request`: Duplicate plate or invalid payload.
    - `409 Conflict`: ID collision; the service may retry creation.
  - Postman tip: Add a test to store the created `id`:
    ```javascript
    const data = pm.response.json();
    if (data && data.id) {
      pm.environment.set("vehicleId", data.id);
    }
    ```

### Academic (`/api/v1/academico`)
- Courses: `GET /academico/cursos`
  - Description: List all courses.
  - Responses:
    - `200 OK`: Array of courses.

- Courses: `POST /academico/cursos`
  - Description: Create a new course.
  - Request body: See Postman examples in the collection for the expected payload structure.
  - Responses:
    - `201 Created`: Returns the created course (includes `id`).
    - `400 Bad Request`: Invalid payload or constraints violated.

- Schedules: `GET /academico/horarios`
  - Description: List all schedules.
  - Responses:
    - `200 OK`: Array of schedules.

- Schedules: `POST /academico/horarios`
  - Description: Create a new schedule (linked to a course).
  - Request body: See Postman examples in the collection for the expected payload structure.
  - Responses:
    - `201 Created`: Returns the created schedule (includes `id`).
    - `400 Bad Request`: Invalid payload or constraints violated.

## Common Errors and Fixes
- `ECONNREFUSED` in Postman:
  - Ensure the server is running: `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`.
  - Verify `{{baseUrl}}` is `http://localhost:8000` and `{{apiBase}}` is `/api/v1`.
  - Prefer hitting `GET /health` first.

- `404 Not Found` for vehicles by ID:
  - The `vehicleId` may not exist. Create a vehicle via `POST /vehiculos` and then reuse its `id`.

## Project Structure (high level)
- `app/main.py`: FastAPI application factory, startup/shutdown hooks, routes mounting.
- `app/api/v1/vehicles.py`: Vehicle endpoints handlers and DTOs.
- `app/api/v1/...`: Academic endpoints (courses and schedules).
- `test/`: Pytest-based tests for vehicles and core behavior.

## Contributing
- Keep endpoints under `api/v1` and avoid breaking changes.
- Update the Postman collection and environment when adding new routes.
- Add tests for new features and run `python -m pytest -q` before pushing changes.

## Requisitos
- Python 3.12.10
- Windows con `py` launcher

## Setup
1. `cd "Final Project\Workshop 3\python-backend"`
2. `py -3.12 -m venv .venv`
3. `.\.venv\Scripts\activate`
4. `python --version` (debe ser 3.12.10)
5. `python -m pip install --upgrade pip`
6. `pip install -r requirements.txt`

## Ejecutar
`uvicorn app.main:app --reload`

## Endpoints
- `GET /` -> estado base
- `GET /api/v1/health` -> healthcheck
 - `POST /api/v1/vehiculos` -> crear vehículo
 - `GET /api/v1/vehiculos` -> listar vehículos
 - `GET /api/v1/vehiculos/{id}` -> obtener por id
 - `PUT /api/v1/vehiculos/{id}` -> actualizar
 - `DELETE /api/v1/vehiculos/{id}` -> eliminar

## Configuración MongoDB
Variables en `.env`:
- `MONGODB_URI` (por defecto `mongodb://localhost:27017`)
- `MONGODB_DB` (por defecto `drivemaster_db`)

Requiere un servidor MongoDB en ejecución.

### Notas de datos
- El `id` de cada vehículo es autoincrementable y se calcula a partir del mayor `id` existente en la colección `vehiculos`.
- Se crean índices únicos en `vehiculos.id` y `vehiculos.placa` para asegurar unicidad.
- Bajo alta concurrencia, el backend reintenta la inserción si ocurre una colisión de `id`.