from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from sqlalchemy import or_

from database import get_db
from models import Usuario, PuntoVenta
from schemas import UsuarioCreate, UsuarioUpdate, UsuarioOut

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


# ==================================================
# LOGIN  (¡DEBE IR ARRIBA SIEMPRE!)
# ==================================================

class LoginRequest(BaseModel):
    email: EmailStr
    contrasena: str

class LoginResponse(BaseModel):
    message: str
    role: str
    punto_venta_id: int | None


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):

    usuario = (
        db.query(Usuario)
        .filter(
            Usuario.email == payload.email,
            Usuario.contrasena == payload.contrasena
        )
        .first()
    )

    if not usuario:
        raise HTTPException(status_code=400, detail="Credenciales inválidas")

    return {
        "message": "Inicio de sesión exitoso",
        "role": usuario.rol,
        "punto_venta_id": usuario.punto_venta_id
    }



# ==================================================
# CREAR USUARIO
# ==================================================
@router.post("/", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def crear_usuario(payload: UsuarioCreate, db: Session = Depends(get_db)):

    # Email único
    existente = db.query(Usuario).filter(Usuario.email == payload.email).first()
    if existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    # Validar punto de venta
    if payload.punto_venta_id is not None:
        pv = db.query(PuntoVenta).get(payload.punto_venta_id)
        if not pv:
            raise HTTPException(status_code=400, detail="Punto de venta no existe")

    usuario = Usuario(
        nombre=payload.nombre,
        email=payload.email,
        contrasena=payload.contrasena,
        rol=payload.rol,
        punto_venta_id=payload.punto_venta_id
    )

    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


# ==================================================
# LISTAR USUARIOS
# ==================================================
@router.get("/", response_model=List[UsuarioOut])
def listar_usuarios(
    q: Optional[str] = Query(None, description="Filtrar por nombre o email"),
    db: Session = Depends(get_db)
):
    query = db.query(Usuario)

    if q:
        like = f"%{q}%"
        query = query.filter(or_(Usuario.nombre.ilike(like), Usuario.email.ilike(like)))

    return query.order_by(Usuario.id_usuario.asc()).all()


# ==================================================
# OBTENER USUARIO POR ID
# ==================================================
@router.get("/{usuario_id}", response_model=UsuarioOut)
def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).get(usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


# ==================================================
# ACTUALIZAR USUARIO
# ==================================================
@router.patch("/{usuario_id}", response_model=UsuarioOut)
def actualizar_usuario(usuario_id: int, payload: UsuarioUpdate, db: Session = Depends(get_db)):

    usuario = db.query(Usuario).get(usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    data = payload.model_dump(exclude_unset=True)

    # Validar email nuevo
    if "email" in data:
        existe = (
            db.query(Usuario)
            .filter(Usuario.email == data["email"], Usuario.id_usuario != usuario_id)
            .first()
        )
        if existe:
            raise HTTPException(status_code=400, detail="El email ya está registrado")

    # Validar nuevo punto de venta
    if "punto_venta_id" in data and data["punto_venta_id"] is not None:
        pv = db.query(PuntoVenta).get(data["punto_venta_id"])
        if not pv:
            raise HTTPException(status_code=400, detail="Punto de venta no existe")

    for k, v in data.items():
        setattr(usuario, k, v)

    db.commit()
    db.refresh(usuario)
    return usuario


# ==================================================
# ELIMINAR USUARIO
# ==================================================
@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)):

    usuario = db.query(Usuario).get(usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(usuario)
    db.commit()
    return
