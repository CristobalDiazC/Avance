"""
Esquemas (schemas) Pydantic utilizados por FastAPI.

Este módulo define los modelos de validación y serialización de datos:

- Libros (crear, actualizar, respuesta)
- Inventario (lectura y operaciones de ajuste)
- Movimientos de inventario (crear y respuesta)

Los esquemas permiten:
- Validar datos de entrada del cliente.
- Controlar qué datos se exponen en las respuestas.
- Convertir modelos ORM a respuestas JSON (from_attributes=True en Pydantic v2).
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


# Esquemas para usuarios
class LibroBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=150)
    categoria: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    paginas_por_libro: int

# Esquema para crear nuevo libro
class LibroCreate(LibroBase):
    pass

# Esquema para actualizar libro
class LibroUpdate(BaseModel):
    nombre: Optional[str] = None
    categoria: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    paginas_por_libro: Optional[int] = None

# Esquema de salida para libro
class LibroOut(LibroBase):
    id_libro: int
    fecha_creacion: datetime
    class Config:
        from_attributes = True  

# Esquema para mostrar el inventario de un libro
class InventarioOut(BaseModel):
    id_inventario: int
    libro_id: int
    stock: int
    updated_at: datetime
    class Config:
        from_attributes = True
        
# Esquema para ajustar el stock sumando o restando unidades
class AjusteStock(BaseModel):
    delta: int = Field(..., description="Cantidad a sumar (puede ser negativa)")

# Esquema para fijar el stock a un valor absoluto
class FijarStock(BaseModel):
    stock: int = Field(..., ge=0, description="Stock absoluto a dejar")

# Esquemas para movimientos de inventario
class MovimientoCreate(BaseModel):
    inventario_id: int
    tipo: str = Field(..., pattern="^(entrada|salida|venta|ajuste)$")
    cantidad: int = Field(..., gt=0)
    usuario_id: Optional[int] = None
    fecha_movimiento: Optional[datetime] = None
    observaciones: Optional[str] = None

# Esquema de salida para movimiento de inventario
class MovimientoOut(BaseModel):
    id_mov_libro: int
    inventario_id: int
    tipo: str
    cantidad: int
    usuario_id: Optional[int]
    fecha_movimiento: datetime
    observaciones: Optional[str]
    class Config:
        from_attributes = True

# ==========================
#   S C H E M A S  PV
# ==========================

class InventarioPVBase(BaseModel):
    id_libro: int
    id_punto_venta: int
    stock: int = 0


class InventarioPVCreate(InventarioPVBase):
    pass


class InventarioPVAjuste(BaseModel):
    delta: int   # para sumar/restar stock


class InventarioPVOut(BaseModel):
    id_inventario: int
    id_libro: int
    libro: str
    id_punto_venta: int
    punto_venta: str
    stock: int
    stock_minimo: int | None = None
    libro: str
    punto_venta: str

    class Config:
        orm_mode = True


# Esquemas para usuarios
class UsuarioBase(BaseModel):
 
    nombre: str = Field(..., min_length=1, max_length=100, description="Nombre completo del usuario")
    email: Optional[EmailStr] = Field(None, description="Correo electrónico del usuario")
    rol: str = Field(
        ...,
        pattern="^(admin|vendedor)$",
        description="Rol del usuario (admin o vendedor)"
    )
    punto_venta_id: Optional[int] = Field(
        None,
        description="ID del punto de venta al que está asociado el usuario"
    )

# Esquema para crear nuevo usuario
class UsuarioCreate(UsuarioBase):

    contrasena: str = Field(
        ...,
        min_length=6,
        description="Contraseña del usuario (idealmente almacenada hasheada)"
    )

# Esquema para actualizar usuario
class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    rol: Optional[str] = Field(
        None,
        pattern="^(admin|vendedor)$",
        description="Nuevo rol del usuario"
    )
    punto_venta_id: Optional[int] = None
    contrasena: Optional[str] = Field(
        None,
        min_length=6,
        description="Nueva contraseña (si se actualiza)"
    )

# Esquema de salida para usuario
class UsuarioOut(UsuarioBase):

    id_usuario: int

    class Config:
        from_attributes = True

# Esquemas para materias primas
class MPBase(BaseModel):
    nombre: str
    unidad: str
    stock_minimo: int
# Esquema para crear materia prima
class MPCrear(MPBase):
    stock_actual: int = 0

# Esquema para actualizar materia prima
class MPActualizar(BaseModel):
    nombre: Optional[str] = None
    unidad: Optional[str] = None
    stock_minimo: Optional[int] = None

# Esquema para entrada de materia prima
class MPEntrada(BaseModel):
    cantidad: int
    usuario_id: int
    observaciones: Optional[str] = None

# Esquema de salida para materia prima
class MPOut(MPBase):
    id_mp: int
    stock_actual: int

    class Config:
        orm_mode = True
        
# Esquema de salida para libro
class LibroOut(BaseModel):
    id_libro: int
    nombre: str
    precio: Optional[float]
    stock_total: int

    class Config:
        orm_mode = True
