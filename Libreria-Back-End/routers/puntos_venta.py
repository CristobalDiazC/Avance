from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import PuntoVenta
from pydantic import BaseModel

router = APIRouter(prefix="/puntos-venta", tags=["Puntos de Venta"])


# ----------- SCHEMAS -----------
class PuntoVentaCreate(BaseModel):
    nombre: str
    ubicacion: str
    tipo: str  # metro, tienda, online


class PuntoVentaUpdate(BaseModel):
    nombre: str | None = None
    ubicacion: str | None = None
    tipo: str | None = None


class PuntoVentaOut(BaseModel):
    id_punto_venta: int
    nombre: str
    ubicacion: str
    tipo: str

    class Config:
        from_attributes = True


# ----------- ENDPOINTS -----------

@router.get("/", response_model=List[PuntoVentaOut])
def listar_puntos_venta(db: Session = Depends(get_db)):
    return db.query(PuntoVenta).order_by(PuntoVenta.id_punto_venta).all()


@router.post("/", response_model=PuntoVentaOut, status_code=status.HTTP_201_CREATED)
def crear_punto_venta(payload: PuntoVentaCreate, db: Session = Depends(get_db)):
    nuevo = PuntoVenta(
        nombre=payload.nombre,
        ubicacion=payload.ubicacion,
        tipo=payload.tipo
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.patch("/{pv_id}", response_model=PuntoVentaOut)
def actualizar_punto_venta(pv_id: int, payload: PuntoVentaUpdate, db: Session = Depends(get_db)):
    pv = db.query(PuntoVenta).get(pv_id)

    if not pv:
        raise HTTPException(status_code=404, detail="Punto de venta no encontrado")

    data = payload.dict(exclude_unset=True)

    for key, value in data.items():
        setattr(pv, key, value)

    db.commit()
    db.refresh(pv)
    return pv

@router.get("/{pv_id}")
def obtener_punto_venta(pv_id: int, db: Session = Depends(get_db)):
    pv = db.query(PuntoVenta).get(pv_id)
    if not pv:
        raise HTTPException(status_code=404, detail="Not Found")
    return pv


@router.delete("/{pv_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_punto_venta(pv_id: int, db: Session = Depends(get_db)):
    pv = db.query(PuntoVenta).get(pv_id)

    if not pv:
        raise HTTPException(status_code=404, detail="Punto de venta no encontrado")

    db.delete(pv)
    db.commit()
    return