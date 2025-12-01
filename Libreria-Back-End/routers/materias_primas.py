from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from database import get_db
from models import MateriaPrima, MovimientoMP, Usuario

router = APIRouter(prefix="/materias_primas", tags=["Materias Primas"])

# ============================
# Esquemas Pydantic
# ============================

class MPBase(BaseModel):
    nombre: str
    unidad: str
    stock_minimo: int

class MPCrear(MPBase):
    stock_actual: int = 0

class MPActualizar(BaseModel):
    nombre: str | None = None
    unidad: str | None = None
    stock_minimo: int | None = None

class MPEntrada(BaseModel):
    cantidad: int
    usuario_id: int
    observaciones: str | None = None

class MPOut(MPBase):
    id_mp: int
    stock_actual: int

    class Config:
        orm_mode = True

# ============================
# Listar materias primas
# ============================

@router.get("/", response_model=List[MPOut])
def listar_materias_primas(db: Session = Depends(get_db)):
    return db.query(MateriaPrima).order_by(MateriaPrima.id_mp.asc()).all()

# ============================
# Crear materia prima
# ============================

@router.post("/", response_model=MPOut, status_code=status.HTTP_201_CREATED)
def crear_materia_prima(payload: MPCrear, db: Session = Depends(get_db)):
    mp = MateriaPrima(**payload.dict())
    db.add(mp)
    db.commit()
    db.refresh(mp)
    return mp

# ============================
# Ajustar datos de materia prima
# ============================

@router.patch("/{mp_id}", response_model=MPOut)
def ajustar_materia_prima(mp_id: int, payload: MPActualizar, db: Session = Depends(get_db)):
    mp = db.query(MateriaPrima).get(mp_id)
    if not mp:
        raise HTTPException(status_code=404, detail="Materia prima no encontrada")

    data = payload.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(mp, k, v)

    db.commit()
    db.refresh(mp)
    return mp

# ============================
# Registrar entrada de stock
# ============================

@router.post("/{mp_id}/entrada", response_model=MPOut)
def registrar_entrada(mp_id: int, payload: MPEntrada, db: Session = Depends(get_db)):
    mp = db.query(MateriaPrima).get(mp_id)
    if not mp:
        raise HTTPException(status_code=404, detail="Materia prima no encontrada")

    usuario = db.query(Usuario).get(payload.usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no válido")

    mp.stock_actual += payload.cantidad

    movimiento = MovimientoMP(
        mp_id=mp_id,
        tipo="entrada",
        cantidad=payload.cantidad,
        usuario_id=payload.usuario_id,
        observaciones=payload.observaciones
    )

    db.add(movimiento)
    db.commit()
    db.refresh(mp)
    return mp


@router.delete("/{mp_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_materia_prima(mp_id: int, db: Session = Depends(get_db)):
    mp = db.query(MateriaPrima).get(mp_id)
    if not mp:
        raise HTTPException(status_code=404, detail="Materia prima no encontrada")

    db.delete(mp)
    db.commit()


# ============================
# Obtener materia prima por ID
# ============================

@router.get("/{mp_id}", response_model=MPOut)
def obtener_materia_prima(mp_id: int, db: Session = Depends(get_db)):
    mp = db.query(MateriaPrima).get(mp_id)
    if not mp:
        raise HTTPException(status_code=404, detail="Materia prima no encontrada")
    return mp
