from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import InventarioPV, Libro, PuntoVenta
from schemas import InventarioPVCreate, InventarioPVAjuste, InventarioPVOut

router = APIRouter(prefix="/inventario-pv", tags=["Inventario por Punto de Venta"])


@router.get("/", response_model=list[InventarioPVOut])
def listar(db: Session = Depends(get_db)):
    registros = db.query(InventarioPV).all()

    return [
        InventarioPVOut(
            id_inventario=r.id_inventario,
            id_libro=r.id_libro,
            id_punto_venta=r.id_punto_venta,
            stock=r.stock,
            stock_minimo=r.stock_minimo,
            libro=r.libro.nombre,
            punto_venta=r.punto_venta.nombre
        )
        for r in registros
    ]


@router.post("/", response_model=InventarioPVOut)
def crear(payload: InventarioPVCreate, db: Session = Depends(get_db)):
    # Validar libro
    libro = db.query(Libro).get(payload.id_libro)
    if not libro:
        raise HTTPException(404, "Libro no existe")

    # Validar punto de venta
    pv = db.query(PuntoVenta).get(payload.id_punto_venta)
    if not pv:
        raise HTTPException(404, "Punto de venta no existe")

    # Ver si ya existe inventario de ese libro en ese PV
    existe = (
        db.query(InventarioPV)
        .filter_by(id_libro=payload.id_libro, id_punto_venta=payload.id_punto_venta)
        .first()
    )

    # SI YA EXISTE → ACTUALIZAR STOCK
    if existe:
        existe.stock += payload.stock
        db.commit()
        db.refresh(existe)
        return InventarioPVOut(
            id_inventario=existe.id_inventario,
            id_libro=existe.id_libro,
            id_punto_venta=existe.id_punto_venta,
            stock=existe.stock,
            stock_minimo=existe.stock_minimo,
            libro=existe.libro.nombre,
            punto_venta=existe.punto_venta.nombre
        )

    # SI NO EXISTE → CREAR
    nuevo = InventarioPV(
        id_libro=payload.id_libro,
        id_punto_venta=payload.id_punto_venta,
        stock=payload.stock
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return InventarioPVOut(
        id_inventario=nuevo.id_inventario,
        id_libro=nuevo.id_libro,
        id_punto_venta=nuevo.id_punto_venta,
        stock=nuevo.stock,
        stock_minimo=nuevo.stock_minimo,
        libro=libro.nombre,
        punto_venta=pv.nombre
    )


@router.post("/{inv_id}/ajustar", response_model=InventarioPVOut)
def ajustar(inv_id: int, payload: InventarioPVAjuste, db: Session = Depends(get_db)):
    inv = db.query(InventarioPV).get(inv_id)
    if not inv:
        raise HTTPException(404, "Inventario PV no existe")

    inv.stock += payload.delta
    if inv.stock < 0:
        raise HTTPException(400, "El stock no puede ser negativo")

    db.commit()
    db.refresh(inv)

    return InventarioPVOut(
        id_inventario=inv.id_inventario,
        id_libro=inv.id_libro,
        id_punto_venta=inv.id_punto_venta,
        stock=inv.stock,
        stock_minimo=inv.stock_minimo,
        libro=inv.libro.nombre,
        punto_venta=inv.punto_venta.nombre
    )


@router.get("/por-pv/{pv_id}", response_model=list[InventarioPVOut])
def listar_por_punto_venta(pv_id: int, db: Session = Depends(get_db)):
    registros = (
        db.query(InventarioPV)
        .filter(InventarioPV.id_punto_venta == pv_id)
        .all()
    )

    return [
        InventarioPVOut(
            id_inventario=r.id_inventario,
            id_libro=r.id_libro,
            id_punto_venta=r.id_punto_venta,
            stock=r.stock,
            stock_minimo=r.stock_minimo,
            libro=r.libro.nombre,
            punto_venta=r.punto_venta.nombre
        )
        for r in registros
    ]
