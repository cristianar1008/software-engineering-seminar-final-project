# Python Backend (FastAPI)

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