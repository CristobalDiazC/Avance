"""
Router para la gestión de movimientos de inventario.

Permite:
- Registrar movimientos (entrada, salida, venta, ajuste)
- Listar movimientos con filtro opcional por tipo

Reglas importantes:
- Se valida que exista el inventario y el usuario (si se envía).
- No se permiten operaciones que dejen stock negativo.
- Se usa SELECT ... FOR UPDATE para bloquear filas y evitar condiciones de carrera.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import MovimientoLibro, InventarioLibro, Usuario
from schemas import MovimientoCreate, MovimientoOut

# Router de movimientos
router = APIRouter(prefix="/movimientos", tags=["Movimientos"])

# Crear un movimiento de inventario
@router.post("/", response_model=MovimientoOut, status_code=status.HTTP_201_CREATED)
def crear_movimiento(payload: MovimientoCreate, db: Session = Depends(get_db)):
    
    inv = db.query(InventarioLibro).with_for_update().get(payload.inventario_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Inventario no existe")

    if payload.usuario_id:
        if not db.query(Usuario).get(payload.usuario_id):
            raise HTTPException(status_code=400, detail="Usuario no existe")


    if payload.tipo in ("salida", "venta"):
        if inv.stock < payload.cantidad:
            raise HTTPException(status_code=400, detail="Stock insuficiente")

    
    if payload.tipo in ("entrada", "ajuste"):
        inv.stock += payload.cantidad
    else: 
        inv.stock -= payload.cantidad

    mov = MovimientoLibro(
        inventario_id=payload.inventario_id,
        tipo=payload.tipo,
        cantidad=payload.cantidad,
        usuario_id=payload.usuario_id,
        fecha_movimiento=payload.fecha_movimiento,
        observaciones=payload.observaciones
    )
    db.add(mov)
    db.commit()
    db.refresh(mov)
    return mov

# Listar movimientos de inventario
@router.get("/", response_model=List[MovimientoOut])
def listar_movimientos(
    tipo: Optional[str] = Query(None, pattern="^(entrada|salida|venta|ajuste)$"),
    db: Session = Depends(get_db)
):
    q = db.query(MovimientoLibro).order_by(MovimientoLibro.fecha_movimiento.desc())
    if tipo:
        q = q.filter(MovimientoLibro.tipo == tipo)
    return q.all()