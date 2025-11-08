from typing import Any, Dict
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import MONGODB_URI, MONGODB_DB

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None

def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(MONGODB_URI)
    return _client

def get_db() -> AsyncIOMotorDatabase:
    global _db
    if _db is None:
        _db = get_client()[MONGODB_DB]
    return _db

async def get_next_sequence(collection: str) -> int:
    """Devuelve el siguiente valor de secuencia para la colección indicada.

    Busca el documento con mayor `id` y retorna +1. Si no existe,
    devuelve 1. La función es genérica para reutilizar en distintas
    colecciones y evitar código repetido.
    """
    db = get_db()
    doc = await db[collection].find_one(sort=[("id", -1)], projection={"id": 1})
    if doc and "id" in doc:
        return int(doc["id"]) + 1
    return 1

async def init_indexes() -> None:
    db = get_db()
    # Cursos y académicos
    await db["cursos"].create_index("id", unique=True)
    await db["cursos"].create_index("codigo", unique=True)
    await db["horarios"].create_index("id", unique=True)
    await db["horarios"].create_index([
        ("curso_id", 1),
        ("dia_semana", 1),
        ("aula", 1),
    ])
    await db["horarios"].create_index([
        ("curso_id", 1),
        ("dia_semana", 1),
    ])
    # Vehículos: índices únicos para id y placa
    await db["vehiculos"].create_index("id", unique=True)
    await db["vehiculos"].create_index("placa", unique=True)
    # Nota: inscripciones no se usan en este alcance


async def get_next_vehicle_id() -> int:
    """Compatibilidad con código existente."""
    return await get_next_sequence("vehiculos")