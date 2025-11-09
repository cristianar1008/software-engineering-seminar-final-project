import pytest
from pymongo.errors import DuplicateKeyError
from app.models.vehicle import VehicleCreate
import app.api.v1.vehicles as vehicles_module


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
        if "placa" in set_fields:
            new_placa = set_fields["placa"]
            for d in self.docs:
                if d is not target and d.get("placa") == new_placa:
                    raise DuplicateKeyError("duplicate key")
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


def test_listar_vehiculos_mock_db(monkeypatch, client):
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
    resp = client.get("/api/v1/vehiculos")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list) and len(data) == 2
    assert data[0]["placa"] == "AAA111" and data[1]["placa"] == "BBB222"


def test_obtener_vehiculo_mock_db(monkeypatch, client):
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
    resp = client.get("/api/v1/vehiculos/10")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == 10 and data["placa"] == "XYZ999"


def test_crear_vehiculo_mock_db(monkeypatch, client):
    fake_db = FakeDB()
    monkeypatch.setattr(vehicles_module, "get_db", lambda: fake_db)

    async def fake_next_vehicle_id():
        return 123

    monkeypatch.setattr(vehicles_module, "get_next_vehicle_id", fake_next_vehicle_id)

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


def test_crear_vehiculo_placa_duplicada_mock_db(monkeypatch, client):
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

    payload = VehicleCreate(
        placa="AAA111",
        modelo="2022",
        marca="Honda",
        estado="activo",
        tipo_licencia="C",
    )
    resp = client.post("/api/v1/vehiculos/", json=payload.model_dump())
    assert resp.status_code == 400
    assert resp.json().get("detail") == "Placa ya existe"


def test_crear_vehiculo_colision_id_reintento_mock_db(monkeypatch, client):
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
    ids = [5, 6]

    async def fake_next_vehicle_id():
        return ids.pop(0)

    monkeypatch.setattr(vehicles_module, "get_next_vehicle_id", fake_next_vehicle_id)

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


def test_actualizar_vehiculo_ok_mock_db(monkeypatch, client):
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
    resp = client.put("/api/v1/vehiculos/5", json={"marca": "Kia"})
    assert resp.status_code == 200
    assert resp.json()["marca"] == "Kia"


def test_actualizar_vehiculo_conflicto_placa_mock_db(monkeypatch, client):
    docs = [
        {"id": 1, "placa": "AAA111", "modelo": "2021", "marca": "Ford", "estado": "activo", "tipo_licencia": "B"},
        {"id": 2, "placa": "BBB222", "modelo": "2022", "marca": "Honda", "estado": "activo", "tipo_licencia": "C"},
    ]
    fake_db = FakeDB(docs)
    monkeypatch.setattr(vehicles_module, "get_db", lambda: fake_db)
    resp = client.put("/api/v1/vehiculos/1", json={"placa": "BBB222"})
    assert resp.status_code == 400
    assert resp.json().get("detail") in ("Placa ya existe", "Conflicto de unicidad al actualizar")


def test_actualizar_vehiculo_payload_vacio_devuelve_actual(client, mock_monkeypatch=pytest.MonkeyPatch()):
    docs = [
        {"id": 7, "placa": "EMP777", "modelo": "2017", "marca": "Mazda", "estado": "activo", "tipo_licencia": "A"},
    ]
    fake_db = FakeDB(docs)
    mock_monkeypatch.setattr(vehicles_module, "get_db", lambda: fake_db)
    resp = client.put("/api/v1/vehiculos/7", json={})
    assert resp.status_code == 200
    assert resp.json()["placa"] == "EMP777"


def test_eliminar_vehiculo_ok_mock_db(monkeypatch, client):
    docs = [
        {"id": 9, "placa": "DEL999", "modelo": "2016", "marca": "Fiat", "estado": "activo", "tipo_licencia": "B"},
    ]
    fake_db = FakeDB(docs)
    monkeypatch.setattr(vehicles_module, "get_db", lambda: fake_db)
    resp = client.delete("/api/v1/vehiculos/9")
    assert resp.status_code == 200
    assert resp.json() == {"deleted": True, "id": 9}


def test_eliminar_vehiculo_no_encontrado_mock_db(monkeypatch, client):
    fake_db = FakeDB([])
    monkeypatch.setattr(vehicles_module, "get_db", lambda: fake_db)
    resp = client.delete("/api/v1/vehiculos/999")
    assert resp.status_code == 404
    assert resp.json().get("detail") == "Vehículo no encontrado"