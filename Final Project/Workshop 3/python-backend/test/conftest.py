import os, sys
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
import pytest
from fastapi.testclient import TestClient
from typing import Any, Dict, List, Optional
from pymongo.errors import DuplicateKeyError
from pymongo import ReturnDocument


class FakeInsertResult:
    def __init__(self, inserted_id: Any = None):
        self.inserted_id = inserted_id


class FakeDeleteResult:
    def __init__(self, deleted_count: int):
        self.deleted_count = deleted_count


class FakeCollection:
    def __init__(self, name: str):
        self.name = name
        self.docs: List[Dict[str, Any]] = []

    async def insert_one(self, doc: Dict[str, Any]) -> FakeInsertResult:
        # Unicidad por colección
        if any(d.get("id") == doc.get("id") for d in self.docs if doc.get("id") is not None):
            raise DuplicateKeyError("Duplicate id")
        if self.name == "cursos":
            codigo = doc.get("codigo")
            if codigo is not None and any(d.get("codigo") == codigo for d in self.docs):
                raise DuplicateKeyError("Duplicate codigo")
        if self.name == "vehiculos":
            placa = doc.get("placa")
            if placa is not None and any(d.get("placa") == placa for d in self.docs):
                raise DuplicateKeyError("Duplicate placa")
        self.docs.append(dict(doc))
        return FakeInsertResult()

    async def find_one(self, filter: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None, sort: Optional[List] = None) -> Optional[Dict[str, Any]]:
        items = self.docs
        if sort:
            # soporta sort=[("id", -1)]
            key, direction = sort[0]
            reverse = direction == -1
            items = sorted(items, key=lambda d: d.get(key, 0), reverse=reverse)
        if not filter:
            return items[0] if items else None
        for d in items:
            if all(d.get(k) == v for k, v in filter.items()):
                return dict(d)
        return None

    async def find_one_and_update(self, filter: Dict[str, Any], update: Dict[str, Any], projection: Optional[Dict[str, Any]] = None, return_document: ReturnDocument = ReturnDocument.AFTER) -> Optional[Dict[str, Any]]:
        for idx, d in enumerate(self.docs):
            if all(d.get(k) == v for k, v in filter.items()):
                if "$set" in update:
                    new_values = update["$set"]
                    # Validación de placa única al actualizar
                    if self.name == "vehiculos" and "placa" in new_values:
                        placa = new_values.get("placa")
                        if placa is not None:
                            for other in self.docs:
                                if other is not d and other.get("placa") == placa:
                                    raise DuplicateKeyError("Duplicate placa")
                    # Validación de código único al actualizar
                    if self.name == "cursos" and "codigo" in new_values:
                        codigo = new_values.get("codigo")
                        if codigo is not None:
                            for other in self.docs:
                                if other is not d and other.get("codigo") == codigo:
                                    raise DuplicateKeyError("Duplicate codigo")
                    d.update(new_values)
                self.docs[idx] = d
                return dict(d)
        return None

    async def delete_one(self, filter: Dict[str, Any]) -> FakeDeleteResult:
        before = len(self.docs)
        self.docs = [d for d in self.docs if not all(d.get(k) == v for k, v in filter.items())]
        deleted = before - len(self.docs)
        return FakeDeleteResult(deleted)

    def _matches(self, d: Dict[str, Any], filter: Dict[str, Any]) -> bool:
        return all(d.get(k) == v for k, v in filter.items())

    def _project(self, d: Dict[str, Any], projection: Optional[Dict[str, Any]]):
        if projection and projection.get("_id") == 0 and "_id" in d:
            nd = dict(d)
            nd.pop("_id", None)
            return nd
        return d

    async def find(self, filter: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None):
        class _Cursor:
            def __init__(self, parent: FakeCollection, filter: Optional[Dict[str, Any]], projection: Optional[Dict[str, Any]]):
                self.parent = parent
                self.filter = filter or {}
                self.projection = projection
                self._items = [parent._project(d, projection) for d in parent.docs if parent._matches(d, self.filter)]
                self._idx = 0

            def __aiter__(self):
                return self

            async def __anext__(self):
                if self._idx >= len(self._items):
                    raise StopAsyncIteration
                item = self._items[self._idx]
                self._idx += 1
                return dict(item)

        return _Cursor(self, filter, projection)

    async def create_index(self, *args, **kwargs) -> None:
        # No-op en fake DB
        return None


class FakeDB:
    def __init__(self):
        self._collections: Dict[str, FakeCollection] = {}

    def __getitem__(self, name: str) -> FakeCollection:
        if name not in self._collections:
            self._collections[name] = FakeCollection(name)
        return self._collections[name]


@pytest.fixture
def test_client(monkeypatch):
    """Cliente de pruebas con DB falsa y eventos de startup/shutdown."""
    from app.main import app
    import app.db.mongo as mongo_module

    # DB por prueba
    db = FakeDB()

    async def _get_db():
        return db

    def _get_client():
        return None

    # parchear dependencias
    monkeypatch.setattr(mongo_module, "get_db", _get_db)
    monkeypatch.setattr(mongo_module, "get_client", _get_client)

    # TestClient maneja el lifespan (startup/shutdown)
    with TestClient(app) as client:
        yield client