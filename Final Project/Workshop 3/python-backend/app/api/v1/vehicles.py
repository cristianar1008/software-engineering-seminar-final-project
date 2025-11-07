from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException
from pymongo.errors import DuplicateKeyError
from app.db.mongo import get_db, get_next_vehicle_id
from app.models.vehicle import Vehicle, VehicleCreate, VehicleUpdate

router = APIRouter(prefix="/vehiculos", tags=["vehiculos"])


@router.post("/", response_model=Vehicle)
async def crear_vehiculo(payload: VehicleCreate) -> Vehicle:
    db = get_db()
    doc = payload.model_dump()
    if doc.get("fecha_registro") is None:
        doc["fecha_registro"] = datetime.utcnow()

    # Intentar inserción con ID autoincrementable, reintentando si hay colisión por concurrencia
    max_retries = 5
    for _ in range(max_retries):
        doc["id"] = await get_next_vehicle_id()
        try:
            await db["vehiculos"].insert_one(doc)
            return Vehicle.from_mongo(doc)
        except DuplicateKeyError:
            # Otra inserción concurrente tomó el mismo id; reintentar con el siguiente
            continue
        except Exception as e:
            # Posibles errores de índice único (placa) u otros
            raise HTTPException(status_code=400, detail=f"Error al crear: {e}")

    raise HTTPException(status_code=500, detail="No se pudo generar un ID único tras varios intentos")


@router.get("/", response_model=List[Vehicle])
async def listar_vehiculos() -> List[Vehicle]:
    db = get_db()
    cursor = db["vehiculos"].find({}, {"_id": 0})
    items = [Vehicle.from_mongo(doc) async for doc in cursor]
    return items


@router.get("/{id}", response_model=Vehicle)
async def obtener_vehiculo(id: int) -> Vehicle:
    db = get_db()
    doc = await db["vehiculos"].find_one({"id": id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return Vehicle.from_mongo(doc)


@router.put("/{id}", response_model=Vehicle)
async def actualizar_vehiculo(id: int, payload: VehicleUpdate) -> Vehicle:
    db = get_db()
    update_doc = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_doc:
        doc = await db["vehiculos"].find_one({"id": id}, {"_id": 0})
        if not doc:
            raise HTTPException(status_code=404, detail="Vehículo no encontrado")
        return Vehicle.from_mongo(doc)
    result = await db["vehiculos"].find_one_and_update(
        {"id": id},
        {"$set": update_doc},
        projection={"_id": 0},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return Vehicle.from_mongo(result)


@router.delete("/{id}")
async def eliminar_vehiculo(id: int) -> dict:
    db = get_db()
    res = await db["vehiculos"].delete_one({"id": id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return {"deleted": True, "id": id}