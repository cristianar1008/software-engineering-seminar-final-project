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

async def get_next_vehicle_id() -> int:
    """Obtiene el siguiente ID autoincrementable basado en la colección 'vehiculos'.

    Busca el mayor 'id' actual y devuelve ese valor + 1. Si no hay documentos,
    devuelve 1. La unicidad se asegura con un índice único en 'id'.
    """
    db = get_db()
    doc = await db["vehiculos"].find_one(sort=[("id", -1)], projection={"id": 1})
    if doc and "id" in doc:
        return int(doc["id"]) + 1
    return 1

async def init_indexes() -> None:
    db = get_db()
    # Índice único para 'id' autoincrementable y para 'placa'
    await db["vehiculos"].create_index("id", unique=True)
    await db["vehiculos"].create_index("placa", unique=True)