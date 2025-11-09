"""Rutas para gestión de cursos, horarios e inscripciones.

Este módulo concentra tanto los modelos Pydantic como los endpoints
FastAPI para cursos, horarios e inscripciones. Evita tocar el micro-
servicio Java: únicamente se gestiona la información académica en
MongoDB. Si se requiere validar estudiantes/profesores contra el
java-backend, se puede realizar vía peticiones HTTP (ver TODO).
"""

from __future__ import annotations
from fastapi import Body
from typing import List, Optional
from datetime import datetime, timedelta 


from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, validator
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.db.mongo import get_db, get_next_sequence
from enum import Enum

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class CourseBase(BaseModel):
    codigo: str = Field(..., min_length=3, max_length=20)
    nombre: str
    creditos: int = Field(..., ge=0)
    descripcion: Optional[str] = None
    vehiculo_id: Optional[int] = Field(None, gt=0)

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    nombre: Optional[str] = None
    creditos: Optional[int] = Field(None, ge=0)
    descripcion: Optional[str] = None
    vehiculo_id: Optional[int] = Field(None, gt=0)

class Course(CourseBase):
    id: int

    class Config:
        from_attributes = True

class ClaseTipo(str, Enum):
    teorica = "teorica"
    practica = "practica"

class ScheduleBase(BaseModel):
    curso_id: int
    dia_semana: int = Field(..., ge=0, le=6)
    hora_inicio: str  # formato "HH:MM"
    hora_fin: str
    aula: str
    tipo: ClaseTipo  # indica si la clase es teórica o práctica
    vehiculo_id: Optional[int] = Field(None, gt=0)

    @validator("hora_inicio", "hora_fin")
    def _valid_time_format(cls, v: str):
        try:
            datetime.strptime(v, "%H:%M")
        except Exception:
            raise ValueError("hora debe tener formato HH:MM")
        return v

    @validator("hora_fin")
    def _end_after_start(cls, v: str, values):
        start = values.get("hora_inicio")
        if start is None:
            return v
        hi = datetime.strptime(start, "%H:%M")
        hf = datetime.strptime(v, "%H:%M")
        if hf <= hi:
            raise ValueError("hora_fin debe ser posterior a hora_inicio")
        return v

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleUpdate(BaseModel):
    dia_semana: Optional[int] = Field(None, ge=0, le=6)
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    aula: Optional[str] = None
    tipo: Optional[ClaseTipo] = None
    vehiculo_id: Optional[int] = Field(None, gt=0)

class Schedule(ScheduleBase):
    id: int

    class Config:
        from_attributes = True

# (Inscripciones eliminadas para dejar solo clases y horarios)

# ---------------------------------------------------------------------------
# Router y endpoints
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/academico", tags=["academico"])


def _intervals_overlap(h1_start: str, h1_end: str, h2_start: str, h2_end: str) -> bool:
    """Devuelve True si los intervalos [h1_start, h1_end) y [h2_start, h2_end) se solapan.
    Las horas están en formato HH:MM.
    """
    s1 = datetime.strptime(h1_start, "%H:%M")
    e1 = datetime.strptime(h1_end, "%H:%M")
    s2 = datetime.strptime(h2_start, "%H:%M")
    e2 = datetime.strptime(h2_end, "%H:%M")
    return (s1 < e2) and (s2 < e1)


# ---------------------------------------------------------------------
# Cursos
# ---------------------------------------------------------------------

@router.post("/cursos", response_model=Course, status_code=status.HTTP_201_CREATED)
async def crear_curso(payload: CourseCreate):
    db = get_db()
    doc = payload.model_dump()
    doc["id"] = await get_next_sequence("cursos")
    try:
        await db["cursos"].insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Código de curso ya existe")
    return Course(**doc)


@router.get("/cursos", response_model=List[Course])
async def listar_cursos():
    db = get_db()
    cursos = [Course(**c) async for c in db["cursos"].find({}, {"_id": 0})]
    return cursos


@router.get("/cursos/{id}", response_model=Course)
async def obtener_curso(id: int):
    db = get_db()
    doc = await db["cursos"].find_one({"id": id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return Course(**doc)


@router.put("/cursos/{id}", response_model=Course)
async def actualizar_curso(id: int, payload: CourseUpdate):
    db = get_db()
    update_doc = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_doc:
        doc = await db["cursos"].find_one({"id": id}, {"_id": 0})
        if not doc:
            raise HTTPException(status_code=404, detail="Curso no encontrado")
        return Course(**doc)
    # No validamos contra el CRUD de vehículos: el campo es libre si se envía
    try:
        updated = await db["cursos"].find_one_and_update(
            {"id": id},
            {"$set": update_doc},
            projection={"_id": 0},
            return_document=ReturnDocument.AFTER,
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Curso no encontrado")
        return Course(**updated)
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Código de curso ya existe")


@router.delete("/cursos/{id}")
async def eliminar_curso(id: int):
    db = get_db()
    res = await db["cursos"].delete_one({"id": id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return {"deleted": True, "id": id}

# ---------------------------------------------------------------------
# Horarios
# ---------------------------------------------------------------------

@router.post("/horarios", response_model=Schedule, status_code=status.HTTP_201_CREATED)
async def crear_horario(payload: ScheduleCreate):
    db = get_db()
    # Verificar curso existente
    course = await db["cursos"].find_one({"id": payload.curso_id})
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Validar solapamiento por curso y día, sin importar aula
    cursor = db["horarios"].find(
        {
            "curso_id": payload.curso_id,
            "dia_semana": payload.dia_semana,
        },
        {"_id": 0},
    )
    async for existing in cursor:
        if _intervals_overlap(
            payload.hora_inicio,
            payload.hora_fin,
            existing.get("hora_inicio"),
            existing.get("hora_fin"),
        ):
            raise HTTPException(
                status_code=400,
                detail="Horario solapa con otro del mismo curso y día",
            )

    doc = payload.model_dump()
    doc["id"] = await get_next_sequence("horarios")
    try:
        await db["horarios"].insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Horario duplicado")
    return Schedule(**doc)


@router.get("/horarios", response_model=List[Schedule])
async def listar_horarios():
    db = get_db()
    horarios = [Schedule(**h) async for h in db["horarios"].find({}, {"_id": 0})]
    return horarios


@router.get("/horarios/{id}", response_model=Schedule)
async def obtener_horario(id: int):
    db = get_db()
    doc = await db["horarios"].find_one({"id": id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    return Schedule(**doc)

# (Se eliminan endpoints y validaciones relacionados con inscripciones e instructor Java)
@router.put("/horarios/{id}", response_model=Schedule)
async def actualizar_horario(id: int, payload: ScheduleUpdate):
    db = get_db()
    update_doc = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_doc:
        doc = await db["horarios"].find_one({"id": id}, {"_id": 0})
        if not doc:
            raise HTTPException(status_code=404, detail="Horario no encontrado")
        return Schedule(**doc)

    # Validación de horas en actualización: si se cambia una, validamos contra la otra existente
    if ("hora_inicio" in update_doc) or ("hora_fin" in update_doc):
        current = await db["horarios"].find_one({"id": id}, {"_id": 0})
        if not current:
            raise HTTPException(status_code=404, detail="Horario no encontrado")
        final_inicio = update_doc.get("hora_inicio", current.get("hora_inicio"))
        final_fin = update_doc.get("hora_fin", current.get("hora_fin"))
        try:
            hi = datetime.strptime(final_inicio, "%H:%M")
            hf = datetime.strptime(final_fin, "%H:%M")
        except Exception:
            raise HTTPException(status_code=400, detail="hora debe tener formato HH:MM")
        if hf <= hi:
            raise HTTPException(status_code=400, detail="hora_fin debe ser posterior a hora_inicio")

    # Validación de solapamiento cuando cambian curso/día/aula/hora
    if any(k in update_doc for k in ("curso_id", "dia_semana", "aula", "hora_inicio", "hora_fin")):
        current = await db["horarios"].find_one({"id": id}, {"_id": 0})
        if not current:
            raise HTTPException(status_code=404, detail="Horario no encontrado")
        final_curso = update_doc.get("curso_id", current.get("curso_id"))
        final_dia = update_doc.get("dia_semana", current.get("dia_semana"))
        final_inicio = update_doc.get("hora_inicio", current.get("hora_inicio"))
        final_fin = update_doc.get("hora_fin", current.get("hora_fin"))

        cursor = db["horarios"].find(
            {
                "curso_id": final_curso,
                "dia_semana": final_dia,
            },
            {"_id": 0},
        )
        async for existing in cursor:
            if existing.get("id") == id:
                continue
            if _intervals_overlap(
                final_inicio,
                final_fin,
                existing.get("hora_inicio"),
                existing.get("hora_fin"),
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Horario solapa con otro del mismo curso y día",
                )

    updated = await db["horarios"].find_one_and_update(
        {"id": id},
        {"$set": update_doc},
        projection={"_id": 0},
        return_document=ReturnDocument.AFTER,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    return Schedule(**updated)

# ---------------------------------------------------------------------
# Asignación de clases (teóricas y prácticas)
# ---------------------------------------------------------------------

class ClaseAsignacionRequest(BaseModel):
    tipo: ClaseTipo
    curso_id: int
    profesor_id: Optional[int] = None
    estudiantes_ids: List[int] = Field(..., min_items=1)
    vehiculo_id: Optional[int] = None
    dia_semana: int = Field(..., ge=0, le=6)
    hora_inicio: str
    hora_fin: str

@router.post("/asignar-clase")
async def asignar_clase(payload: ClaseAsignacionRequest = Body(...)):
    """
    Asigna clases teóricas o prácticas según las reglas:
    - Teórica: un profesor puede tener varios estudiantes simultáneamente.
    - Práctica: un profesor y un vehículo solo pueden tener una clase a la vez.
    """
    db = get_db()

    # 1️⃣ Validar curso
    curso = await db["cursos"].find_one({"id": payload.curso_id})
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # 2️⃣ Validar formato de horas y rango permitido
    hi = datetime.strptime(payload.hora_inicio, "%H:%M")
    hf = datetime.strptime(payload.hora_fin, "%H:%M")
    if hf <= hi:
        raise HTTPException(status_code=400, detail="hora_fin debe ser posterior a hora_inicio")
    if hi.hour < 6 or hf.hour > 21:
        raise HTTPException(status_code=400, detail="Horario permitido es entre 06:00 y 21:00")

    # 3️⃣ Validar disponibilidad del profesor
    if payload.profesor_id:
        cursor = db["horarios"].find({
            "profesor_id": payload.profesor_id,
            "dia_semana": payload.dia_semana
        })
        async for existing in cursor:
            if _intervals_overlap(payload.hora_inicio, payload.hora_fin,
                                  existing["hora_inicio"], existing["hora_fin"]):
                raise HTTPException(status_code=400, detail="Profesor ocupado en ese horario")

    # 4️⃣ Validar vehículo si es clase práctica
    if payload.tipo == ClaseTipo.practica:
        if not payload.vehiculo_id:
            raise HTTPException(status_code=400, detail="vehiculo_id es requerido para clase práctica")
        cursor = db["horarios"].find({
            "vehiculo_id": payload.vehiculo_id,
            "dia_semana": payload.dia_semana
        })
        async for existing in cursor:
            if _intervals_overlap(payload.hora_inicio, payload.hora_fin,
                                  existing["hora_inicio"], existing["hora_fin"]):
                raise HTTPException(status_code=400, detail="Vehículo ocupado en ese horario")

    # 5️⃣ Crear asignaciones (una por estudiante)
    asignaciones_creadas = []
    for estudiante_id in payload.estudiantes_ids:
        nuevo = {
            "id": await get_next_sequence("horarios"),
            "curso_id": payload.curso_id,
            "profesor_id": payload.profesor_id,
            "estudiante_id": estudiante_id,
            "dia_semana": payload.dia_semana,
            "hora_inicio": payload.hora_inicio,
            "hora_fin": payload.hora_fin,
            "tipo": payload.tipo.value,
            "vehiculo_id": payload.vehiculo_id,
        }
        await db["horarios"].insert_one(nuevo)
        asignaciones_creadas.append({"id": nuevo["id"]})

    return {
        "ok": True,
        "mensaje": f"Clase {payload.tipo.value} asignada correctamente",
        "asignaciones_creadas": asignaciones_creadas
    }

# ---------------------------------------------------------------------
# Endpoints complementarios para gestión de asignaciones
# ---------------------------------------------------------------------

@router.get("/asignaciones")
async def listar_asignaciones(
    profesor_id: Optional[int] = None,
    estudiante_id: Optional[int] = None,
    dia_semana: Optional[int] = None,
):
    """
    Lista todas las clases asignadas, con filtros opcionales:
    - profesor_id: filtra por profesor
    - estudiante_id: filtra por estudiante
    - dia_semana: filtra por día de la semana (0=lunes ... 6=domingo)
    """
    db = get_db()

    filtros = {}
    if profesor_id is not None:
        filtros["profesor_id"] = profesor_id
    if estudiante_id is not None:
        filtros["estudiante_id"] = estudiante_id
    if dia_semana is not None:
        filtros["dia_semana"] = dia_semana

    cursor = db["horarios"].find(filtros, {"_id": 0})
    resultados = []
    async for doc in cursor:
        # opcional: enriquecer con nombre del curso
        curso = await db["cursos"].find_one({"id": doc["curso_id"]}, {"_id": 0, "nombre": 1})
        doc["curso_nombre"] = curso["nombre"] if curso else "Desconocido"
        resultados.append(doc)
    return resultados


@router.delete("/asignaciones/{id}")
async def eliminar_asignacion(id: int):
    """
    Elimina una clase asignada (teórica o práctica) según su id.
    """
    db = get_db()
    res = await db["horarios"].delete_one({"id": id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
    return {"ok": True, "mensaje": f"Asignación {id} eliminada correctamente"}


@router.put("/asignaciones/{id}")
async def actualizar_asignacion(id: int, payload: ScheduleUpdate):
    """
    Permite actualizar datos básicos de una asignación ya creada:
    - horario, aula, tipo, vehículo, etc.
    Aplica validaciones similares a las de creación.
    """
    db = get_db()
    update_doc = {k: v for k, v in payload.model_dump().items() if v is not None}

    if not update_doc:
        raise HTTPException(status_code=400, detail="No se enviaron campos para actualizar")

    # Validar formato de horas (si se envían)
    if "hora_inicio" in update_doc or "hora_fin" in update_doc:
        current = await db["horarios"].find_one({"id": id}, {"_id": 0})
        if not current:
            raise HTTPException(status_code=404, detail="Asignación no encontrada")

        hi = update_doc.get("hora_inicio", current["hora_inicio"])
        hf = update_doc.get("hora_fin", current["hora_fin"])
        try:
            hi_dt = datetime.strptime(hi, "%H:%M")
            hf_dt = datetime.strptime(hf, "%H:%M")
        except Exception:
            raise HTTPException(status_code=400, detail="hora debe tener formato HH:MM")
        if hf_dt <= hi_dt:
            raise HTTPException(status_code=400, detail="hora_fin debe ser posterior a hora_inicio")

    # Actualizar documento
    updated = await db["horarios"].find_one_and_update(
        {"id": id},
        {"$set": update_doc},
        projection={"_id": 0},
        return_document=ReturnDocument.AFTER,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")

    return {"ok": True, "mensaje": "Asignación actualizada correctamente", "data": updated}


@router.get("/disponibilidad")
async def obtener_disponibilidad(dia_semana: int):
    """
    Devuelve los bloques horarios disponibles entre 6:00 y 21:00
    para un día específico (0=lunes ... 6=domingo).
    Bloques de 1 hora.
    """
    db = get_db()
    horarios_ocupados = [h async for h in db["horarios"].find({"dia_semana": dia_semana}, {"_id": 0})]

    bloques = []
    hora_actual = datetime.strptime("06:00", "%H:%M")
    fin_dia = datetime.strptime("21:00", "%H:%M")

    while hora_actual < fin_dia:
        siguiente = hora_actual + timedelta(hours=1)
        bloque_libre = True
        for h in horarios_ocupados:
            if _intervals_overlap(
                hora_actual.strftime("%H:%M"),
                siguiente.strftime("%H:%M"),
                h["hora_inicio"],
                h["hora_fin"],
            ):
                bloque_libre = False
                break
        bloques.append({
            "inicio": hora_actual.strftime("%H:%M"),
            "fin": siguiente.strftime("%H:%M"),
            "disponible": bloque_libre
        })
        hora_actual = siguiente

    return bloques
