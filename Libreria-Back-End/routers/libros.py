"""
Router para la gestión de libros.

Incluye funcionalidades para:
- Crear libros
- Listar todos los libros (con búsqueda opcional)
- Obtener un libro por ID
- Actualizar parcialmente un libro
- Eliminar un libro

Cada endpoint usa modelos Pydantic para validación y modelos SQLAlchemy para
interactuar con la base de datos.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import SessionLocal
from schemas import LibroCreate, LibroUpdate, LibroOut
from sqlalchemy import func
from models import Libro, InventarioPV, InventarioLibro  # Asegúrate de tener InventarioPV en models

# Router de libros
router = APIRouter(prefix="/libros", tags=["Libros"])

# Dependencia para obtener sesión de DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
# Crear libros
@router.post("/", response_model=LibroOut, status_code=201)
def crear_libro(payload: LibroCreate, db: Session = Depends(get_db)):

    # 1. Filtrar campos del libro (evitar cantidad_libros)
    data_libro = payload.model_dump(exclude={"cantidad_libros"})

    # 2. Crear el libro
    libro = Libro(**data_libro)
    db.add(libro)
    db.commit()
    db.refresh(libro)

    # 3. Crear inventario con la cantidad solicitada
    inventario = InventarioLibro(
        libro_id=libro.id_libro,
        stock=payload.cantidad_libros
    )
    db.add(inventario)
    db.commit()

    # 4. Respuesta
    return {
        "id_libro": libro.id_libro,
        "nombre": libro.nombre,
        "precio": libro.precio,
        "stock_total": payload.cantidad_libros
    }



# Listar todos los libros
@router.get("/", response_model=List[LibroOut])
def listar_libros(q: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Libro)
    if q:
        query = query.filter(Libro.nombre.ilike(f"%{q}%"))

    libros = query.all()

    resultado = []
    for libro in libros:
        # stock global
        stock_global = (
            db.query(func.sum(InventarioLibro.stock))
            .filter(InventarioLibro.libro_id == libro.id_libro)
            .scalar()
        ) or 0

        # stock en puntos de venta
        stock_pv = (
            db.query(func.sum(InventarioPV.stock))
            .filter(InventarioPV.id_libro == libro.id_libro)
            .scalar()
        ) or 0

        stock_total = stock_global + stock_pv

        resultado.append({
            "id_libro": libro.id_libro,
            "nombre": libro.nombre,
            "precio": libro.precio,
            "stock_total": stock_total
        })

    return resultado

# Obtener un libro por ID
@router.get("/{libro_id}", response_model=LibroOut)
def obtener_libro(libro_id: int, db: Session = Depends(get_db)):

    libro = db.query(Libro).get(libro_id)
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")

    # stock en inventario global
    stock_global = (
        db.query(func.sum(InventarioLibro.stock))
        .filter(InventarioLibro.libro_id == libro.id_libro)
        .scalar()
    ) or 0

    # stock en puntos de venta
    stock_pv = (
        db.query(func.sum(InventarioPV.stock))
        .filter(InventarioPV.id_libro == libro.id_libro)
        .scalar()
    ) or 0

    stock_total = stock_global + stock_pv

    # respuesta formateada PARA EL SCHEMA LibroOut
    return {
        "id_libro": libro.id_libro,
        "nombre": libro.nombre,
        "precio": libro.precio,
        "stock_total": stock_total
    }

# Actualizar parcialmente un libro
@router.patch("/{libro_id}", response_model=LibroOut)
def actualizar_libro(libro_id: int, payload: LibroUpdate, db: Session = Depends(get_db)):
    libro = db.query(Libro).get(libro_id)
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")

    # Aplicar solo los cambios recibidos
    data = payload.model_dump(exclude_unset=True)

    for campo, valor in data.items():
        setattr(libro, campo, valor)

    db.commit()
    db.refresh(libro)

    # Calcular stock_total
    stock_global = (
        db.query(func.sum(InventarioLibro.stock))
        .filter(InventarioLibro.libro_id == libro.id_libro)
        .scalar()
    ) or 0

    stock_pv = (
        db.query(func.sum(InventarioPV.stock))
        .filter(InventarioPV.id_libro == libro.id_libro)
        .scalar()
    ) or 0

    stock_total = stock_global + stock_pv

    # DEVOLVER FORMATO CORRECTO
    return {
        "id_libro": libro.id_libro,
        "nombre": libro.nombre,
        "precio": libro.precio,
        "stock_total": stock_total
    }
    
    
# Eliminar un libro
@router.delete("/{libro_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_libro(libro_id: int, db: Session = Depends(get_db)):
    libro = db.query(Libro).get(libro_id)
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")

    # 1️⃣ Eliminar inventario global (inventario_libros)
    db.query(InventarioLibro).filter_by(libro_id=libro_id).delete()

    # 2️⃣ Eliminar inventario por punto de venta (inventario_pv)
    db.query(InventarioPV).filter_by(id_libro=libro_id).delete()

    # 4️⃣ Finalmente elimina el libro
    db.delete(libro)
    db.commit()
    return