import sys
from pathlib import Path
from fastapi.testclient import TestClient
import pytest
from pydantic import ValidationError
from pymongo.errors import DuplicateKeyError

# Asegura que el paquete 'app' del backend esté en PYTHONPATH
BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.main import app
from app.api.v1.academico import (
    _intervals_overlap,
    ScheduleBase,
    ClaseTipo,
    CourseBase,
    CourseUpdate,
)
from app.models.vehicle import Vehicle, VehicleCreate
import app.api.v1.vehicles as vehicles_module


def test_root_ok():
    client = TestClient(app)
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("status") == "ok"


def test_health_ok():
    client = TestClient(app)
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("status") == "healthy"


def test_intervals_overlap():
    assert _intervals_overlap("08:00", "09:00", "08:30", "08:45") is True
    assert _intervals_overlap("08:00", "09:00", "09:00", "10:00") is False
    assert _intervals_overlap("08:00", "09:00", "07:00", "08:00") is False


def test_vehicle_from_mongo():
    doc = {
        "id": 1,
        "placa": "ABC123",
        "modelo": "2020",
        "marca": "Toyota",
        "estado": "activo",
        "fecha_registro": None,
        "tipo_licencia": "B",
        "fecha_salida": None,
    }
    v = Vehicle.from_mongo(doc)
    assert v.id == 1
    assert v.placa == "ABC123"
    assert v.marca == "Toyota"


def test_intervals_overlap_identical_interval():
    # Intervalos idénticos deben solaparse
    assert _intervals_overlap("08:00", "09:00", "08:00", "09:00") is True


def test_intervals_overlap_partial_at_start():
    # El segundo comienza antes y termina dentro del primero
    assert _intervals_overlap("08:00", "09:00", "07:30", "08:30") is True


def test_schedule_valid_creation():
    s = ScheduleBase(
        curso_id=1,
        dia_semana=1,
        hora_inicio="08:00",
        hora_fin="09:00",
        aula="A1",
        tipo=ClaseTipo.teorica,
    )
    assert s.dia_semana == 1 and s.hora_inicio == "08:00"


def test_schedule_invalid_time_format():
    with pytest.raises(ValidationError):
        ScheduleBase(
            curso_id=1,
            dia_semana=1,
            hora_inicio="08-00",  # formato inválido
            hora_fin="09:00",
            aula="A1",
            tipo=ClaseTipo.teorica,
        )


def test_schedule_end_before_start():
    with pytest.raises(ValidationError):
        ScheduleBase(
            curso_id=1,
            dia_semana=1,
            hora_inicio="09:00",
            hora_fin="08:00",
            aula="A1",
            tipo=ClaseTipo.practica,
        )


def test_schedule_invalid_day():
    with pytest.raises(ValidationError):
        ScheduleBase(
            curso_id=1,
            dia_semana=7,  # fuera de rango
            hora_inicio="08:00",
            hora_fin="09:00",
            aula="A1",
            tipo=ClaseTipo.teorica,
        )


def test_coursebase_vehiculo_id_validation():
    # vehiculo_id debe ser > 0 si se especifica
    with pytest.raises(ValidationError):
        CourseBase(
            codigo="MAT101",
            nombre="Matemáticas",
            creditos=3,
            vehiculo_id=0,
        )


def test_coursebase_creditos_non_negative():
    with pytest.raises(ValidationError):
        CourseBase(
            codigo="HIS200",
            nombre="Historia",
            creditos=-1,
        )


def test_cors_header_for_allowed_origin():
    client = TestClient(app)
    resp = client.get("/", headers={"Origin": "http://localhost:4200"})
    # Debe devolver el origen permitido en el header CORS
    assert resp.headers.get("access-control-allow-origin") == "http://localhost:4200"


def test_cors_header_for_secondary_origin():
    client = TestClient(app)
    resp = client.get("/", headers={"Origin": "http://127.0.0.1:4201"})
    assert resp.headers.get("access-control-allow-origin") == "http://127.0.0.1:4201"


def test_app_title():
    # Verifica el título de la aplicación
    assert app.title == "Seminar Project API"


def test_root_message_present():
    client = TestClient(app)
    resp = client.get("/")
    assert resp.json().get("message") == "API running"


def test_course_codigo_min_length():
    # 'codigo' debe tener al menos 3 caracteres
    with pytest.raises(ValidationError):
        CourseBase(codigo="AB", nombre="X", creditos=1)


def test_courseupdate_creditos_invalid():
    # creditos en actualización respeta ge=0 si se provee
    with pytest.raises(ValidationError):
        CourseUpdate(creditos=-5)


def test_courseupdate_valid_empty():
    # Instanciación vacía es válida
    cu = CourseUpdate()
    assert isinstance(cu, CourseUpdate)


def test_schedule_tipo_invalid_enum():
    # Valor fuera del enum debe fallar
    with pytest.raises(ValidationError):
        ScheduleBase(
            curso_id=1,
            dia_semana=1,
            hora_inicio="08:00",
            hora_fin="09:00",
            aula="A1",
            tipo="laboratorio",  # inválido
        )


def test_intervals_no_overlap_far_apart():
    # Intervalos completamente separados
    assert _intervals_overlap("06:00", "07:00", "08:00", "09:00") is False


# ------------------------
# Pruebas de vehículos (mock DB)
# ------------------------

class FakeAsyncCursor:
    def __init__(self, docs):
        self.docs = docs
        self._i = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self._i >= len(self.docs):
            raise StopAsyncIteration
        item = self.docs[self._i]
        self._i += 1
        return item


class FakeCollection:
    def __init__(self, docs=None):
        self.docs = docs or []
        self.inserts = []

    def find(self, *_args, **_kwargs):
        return FakeAsyncCursor(list(self.docs))

    async def find_one(self, query, *_args, **_kwargs):
        if "id" in query:
            for d in self.docs:
                if d.get("id") == query["id"]:
                    return d
            return None
        if "placa" in query:
            for d in self.docs:
                if d.get("placa") == query["placa"]:
                    return d
            return None
        return None

    async def insert_one(self, doc):
        # Simula índices únicos de id y placa
        for d in self.docs:
            if d.get("id") == doc.get("id") or d.get("placa") == doc.get("placa"):
                raise DuplicateKeyError("duplicate key")
        self.inserts.append(doc)
        self.docs.append(doc)
        return {"acknowledged": True}

    async def find_one_and_update(self, filter, update, projection=None, return_document=None):
        target = None
        for d in self.docs:
            match = True
            for k, v in filter.items():
                if d.get(k) != v:
                    match = False
                    break
            if match:
                target = d
                break
        if not target:
            return None
        set_fields = update.get("$set", {})
        # Simula conflicto de placa única
        if "placa" in set_fields:
            new_placa = set_fields["placa"]
            for d in self.docs:
                if d is not target and d.get("placa") == new_placa:
                    raise DuplicateKeyError("duplicate key")
        # Aplica actualización
        for k, v in set_fields.items():
            target[k] = v
        return dict(target)

    async def delete_one(self, filter):
        del_count = 0
        for i, d in enumerate(self.docs):
            match = True
            for k, v in filter.items():
                if d.get(k) != v:
                    match = False
                    break
            if match:
                self.docs.pop(i)
                del_count = 1
                break
        class Res:
            def __init__(self, c):
                self.deleted_count = c
        return Res(del_count)


class FakeDB:
    def __init__(self, vehiculos_docs=None):
        self._vehiculos = FakeCollection(vehiculos_docs or [])

    def __getitem__(self, name):
        if name == "vehiculos":
            return self._vehiculos
        raise KeyError(name)


def test_listar_vehiculos_mock_db(monkeypatch):
    fake_docs = [
        {
            "id": 1,
            "placa": "AAA111",
            "modelo": "2021",
            "marca": "Ford",
            "estado": "activo",
            "fecha_registro": None,
            "tipo_licencia": "B",
            "fecha_salida": None,
        },
        {
            "id": 2,
            "placa": "BBB222",
            "modelo": "2022",
            "marca": "Honda",
            "estado": "activo",
            "fecha_registro": None,
            "tipo_licencia": "C",
            "fecha_salida": None,
        },
    ]

    monkeypatch.setattr(vehicles_module, "get_db", lambda: FakeDB(fake_docs))
    client = TestClient(app)
    resp = client.get("/api/v1/vehiculos")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list) and len(data) == 2
    assert data[0]["placa"] == "AAA111" and data[1]["placa"] == "BBB222"


def test_obtener_vehiculo_mock_db(monkeypatch):
    fake_docs = [
        {
            "id": 10,
            "placa": "XYZ999",
            "modelo": "2019",
            "marca": "Toyota",
            "estado": "activo",
            "fecha_registro": None,
            "tipo_licencia": "A",
            "fecha_salida": None,
        }
    ]
    monkeypatch.setattr(vehicles_module, "get_db", lambda: FakeDB(fake_docs))
    client = TestClient(app)
    resp = client.get("/api/v1/vehiculos/10")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == 10 and data["placa"] == "XYZ999"


def test_crear_vehiculo_mock_db(monkeypatch):
    fake_db = FakeDB()
    monkeypatch.setattr(vehicles_module, "get_db", lambda: fake_db)
    async def fake_next_vehicle_id():
        return 123
    monkeypatch.setattr(vehicles_module, "get_next_vehicle_id", fake_next_vehicle_id)

    client = TestClient(app)
    payload = VehicleCreate(
        placa="NEW123",
        modelo="2020",
        marca="Nissan",
        estado="activo",
        tipo_licencia="B",
        fecha_registro=None,
        fecha_salida=None,
    )

    resp = client.post("/api/v1/vehiculos/", json=payload.model_dump())
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == 123 and data["placa"] == "NEW123"


def test_crear_vehiculo_placa_duplicada_mock_db(monkeypatch):
    existing = [
        {
            "id": 50,
            "placa": "AAA111",
            "modelo": "2021",
            "marca": "Ford",
            "estado": "activo",
            "tipo_licencia": "B",
        }
    ]
    fake_db = FakeDB(existing)
    monkeypatch.setattr(vehicles_module, "get_db", lambda: fake_db)
    async def fake_next_vehicle_id():
        return 51
    monkeypatch.setattr(vehicles_module, "get_next_vehicle_id", fake_next_vehicle_id)

    client = TestClient(app)
    payload = VehicleCreate(
        placa="AAA111",  # duplicada
        modelo="2022",
        marca="Honda",
        estado="activo",
        tipo_licencia="C",
    )
    resp = client.post("/api/v1/vehiculos/", json=payload.model_dump())
    assert resp.status_code == 400
    assert resp.json().get("detail") == "Placa ya existe"


def test_crear_vehiculo_colision_id_reintento_mock_db(monkeypatch):
    existing = [
        {
            "id": 5,
            "placa": "COL111",
            "modelo": "2020",
            "marca": "VW",
            "estado": "activo",
            "tipo_licencia": "B",
        }
    ]
    fake_db = FakeDB(existing)
    monkeypatch.setattr(vehicles_module, "get_db", lambda: fake_db)
    # Primer intento devuelve 5 (colisión por id), segundo 6
    ids = [5, 6]
    async def fake_next_vehicle_id():
        return ids.pop(0)
    monkeypatch.setattr(vehicles_module, "get_next_vehicle_id", fake_next_vehicle_id)

    client = TestClient(app)
    payload = VehicleCreate(
        placa="NEWCOL",
        modelo="2021",
        marca="Kia",
        estado="activo",
        tipo_licencia="A",
    )
    resp = client.post("/api/v1/vehiculos/", json=payload.model_dump())
    assert resp.status_code == 200
    assert resp.json()["id"] == 6


def test_actualizar_vehiculo_ok_mock_db(monkeypatch):
    docs = [
        {
            "id": 5,
            "placa": "UPD555",
            "modelo": "2018",
            "marca": "Chevy",
            "estado": "activo",
            "tipo_licencia": "B",
        }
    ]
    fake_db = FakeDB(docs)
    monkeypatch.setattr(vehicles_module, "get_db", lambda: fake_db)
    client = TestClient(app)
    resp = client.put("/api/v1/vehiculos/5", json={"marca": "Kia"})
    assert resp.status_code == 200
    assert resp.json()["marca"] == "Kia"


def test_actualizar_vehiculo_conflicto_placa_mock_db(monkeypatch):
    docs = [
        {"id": 1, "placa": "AAA111", "modelo": "2021", "marca": "Ford", "estado": "activo", "tipo_licencia": "B"},
        {"id": 2, "placa": "BBB222", "modelo": "2022", "marca": "Honda", "estado": "activo", "tipo_licencia": "C"},
    ]
    fake_db = FakeDB(docs)
    monkeypatch.setattr(vehicles_module, "get_db", lambda: fake_db)
    client = TestClient(app)
    # Intento poner placa de otro vehículo
    resp = client.put("/api/v1/vehiculos/1", json={"placa": "BBB222"})
    assert resp.status_code == 400
    assert resp.json().get("detail") in ("Placa ya existe", "Conflicto de unicidad al actualizar")


def test_actualizar_vehiculo_payload_vacio_devuelve_actual(mock_monkeypatch=pytest.MonkeyPatch()):
    # Usamos MonkeyPatch explícito para evitar firma especial de pytest
    docs = [
        {"id": 7, "placa": "EMP777", "modelo": "2017", "marca": "Mazda", "estado": "activo", "tipo_licencia": "A"},
    ]
    fake_db = FakeDB(docs)
    mock_monkeypatch.setattr(vehicles_module, "get_db", lambda: fake_db)
    client = TestClient(app)
    resp = client.put("/api/v1/vehiculos/7", json={})
    assert resp.status_code == 200
    assert resp.json()["placa"] == "EMP777"


def test_eliminar_vehiculo_ok_mock_db(monkeypatch):
    docs = [
        {"id": 9, "placa": "DEL999", "modelo": "2016", "marca": "Fiat", "estado": "activo", "tipo_licencia": "B"},
    ]
    fake_db = FakeDB(docs)
    monkeypatch.setattr(vehicles_module, "get_db", lambda: fake_db)
    client = TestClient(app)
    resp = client.delete("/api/v1/vehiculos/9")
    assert resp.status_code == 200
    assert resp.json() == {"deleted": True, "id": 9}


def test_eliminar_vehiculo_no_encontrado_mock_db(monkeypatch):
    fake_db = FakeDB([])
    monkeypatch.setattr(vehicles_module, "get_db", lambda: fake_db)
    client = TestClient(app)
    resp = client.delete("/api/v1/vehiculos/999")
    assert resp.status_code == 404
    assert resp.json().get("detail") == "Vehículo no encontrado"