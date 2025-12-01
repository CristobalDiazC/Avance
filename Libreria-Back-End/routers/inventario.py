"""
Router de inventario de libros.

Expone endpoints para:
- Crear inventario para un libro específico.
- Listar inventario de todos los libros (con filtro opcional por nombre).
- Obtener el stock de un libro concreto.
- Ajustar el stock (sumar/restar).
- Fijar el stock a un valor absoluto.

Este router se monta con el prefijo `/inventario` y la etiqueta "Inventario".
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from database import get_db
from models import InventarioLibro, Libro
from schemas import InventarioOut, AjusteStock, FijarStock

# Router de inventario
router = APIRouter(prefix="/inventario", tags=["Inventario"])

# Crear inventario para un libro específico
@router.post("/{libro_id}", response_model=InventarioOut, status_code=status.HTTP_201_CREATED)
def crear_inventario_para_libro(libro_id: int, db: Session = Depends(get_db)):
    libro = db.query(Libro).get(libro_id)
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no existe")
    inv = db.query(InventarioLibro).filter_by(libro_id=libro_id).first()
    if inv:
        return inv
    inv = InventarioLibro(libro_id=libro_id, stock=0)
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv

# Listar inventario de todos los libros
@router.get("/", response_model=List[InventarioOut])
def listar_inventario(
    q: Optional[str] = Query(None, description="Filtra por nombre de libro"),
    db: Session = Depends(get_db)
):
    query = db.query(InventarioLibro).join(Libro, InventarioLibro.libro_id == Libro.id_libro)
    if q:
        query = query.filter(Libro.nombre.ilike(f"%{q}%"))
    return query.order_by(Libro.nombre.asc()).all()

# Obtener el stock de un libro concreto
@router.get("/{libro_id}", response_model=InventarioOut)
def obtener_stock(libro_id: int, db: Session = Depends(get_db)):
    inv = db.query(InventarioLibro).filter_by(libro_id=libro_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventario no encontrado para ese libro")
    return inv

# Ajustar el stock (sumar/restar)
@router.post("/{libro_id}/ajustar", response_model=InventarioOut)
def ajustar_stock(libro_id: int, payload: AjusteStock, db: Session = Depends(get_db)):
    # bloquea fila para evitar carreras
    inv = db.query(InventarioLibro).with_for_update().filter_by(libro_id=libro_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventario no encontrado")
    nuevo = inv.stock + payload.delta
    if nuevo < 0:
        raise HTTPException(status_code=400, detail="El ajuste dejaría stock negativo")
    inv.stock = nuevo
    db.commit()
    db.refresh(inv)
    return inv

# Fijar el stock a un valor absoluto
@router.put("/{libro_id}/fijar", response_model=InventarioOut)
def fijar_stock(libro_id: int, payload: FijarStock, db: Session = Depends(get_db)):
    inv = db.query(InventarioLibro).with_for_update().filter_by(libro_id=libro_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventario no encontrado")
    inv.stock = payload.stock
    db.commit()
    db.refresh(inv)
    return inv

@router.get("/stock-bajo")
def inventario_stock_bajo(db: Session = Depends(get_db)):
    """
    Devuelve libros cuyo stock actual es menor al stock mínimo configurado.
    """
    resultados = (
        db.query(
            Libro.nombre.label("libro"),
            InventarioLibro.stock,
            Libro.stock_minimo
        )
        .join(Libro, Libro.id_libro == InventarioLibro.libro_id)
        .filter(InventarioLibro.stock < Libro.stock_minimo)
        .all()
    )

    resp = []
    for row in resultados:
        resp.append({
            "libro": row.libro,
            "stock": row.stock,
            "stock_minimo": row.stock_minimo
        })

    return resp

