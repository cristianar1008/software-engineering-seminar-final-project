from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class VehicleBase(BaseModel):
    placa: str = Field(..., description="PLACA")
    modelo: str = Field(..., description="MODELO")
    marca: str = Field(..., description="MARCA")
    estado: str = Field(..., description="ESTADO")
    fecha_registro: Optional[datetime] = Field(
        default=None, description="FECHA DE REGISTRO"
    )
    tipo_licencia: str = Field(..., description="TIPO DE LICENCIA")
    fecha_salida: Optional[datetime] = Field(
        default=None, description="FECHA DE SALIDA"
    )


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    placa: Optional[str] = None
    modelo: Optional[str] = None
    marca: Optional[str] = None
    estado: Optional[str] = None
    fecha_registro: Optional[datetime] = None
    tipo_licencia: Optional[str] = None
    fecha_salida: Optional[datetime] = None


class Vehicle(VehicleBase):
    id: int = Field(..., description="ID autoincrementable")

    @staticmethod
    def from_mongo(doc: dict) -> "Vehicle":
        return Vehicle(
            id=doc.get("id"),
            placa=doc.get("placa"),
            modelo=doc.get("modelo"),
            marca=doc.get("marca"),
            estado=doc.get("estado"),
            fecha_registro=doc.get("fecha_registro"),
            tipo_licencia=doc.get("tipo_licencia"),
            fecha_salida=doc.get("fecha_salida"),
        )