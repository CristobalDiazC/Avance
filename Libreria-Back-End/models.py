"""
Modelos ORM de SQLAlchemy para la aplicación de librería.
"""

from sqlalchemy import Column, Integer, String, Enum, Text, ForeignKey, DateTime, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import datetime
import enum

# ---------------------------------------------------------
# ENUMS
# ---------------------------------------------------------

class TipoPuntoVenta(enum.Enum):
    tienda = "tienda"
    metro = "metro"
    online = "online"

class RolUsuario(enum.Enum):
    admin = "admin"
    vendedor = "vendedor"

class TipoMovimiento(enum.Enum):
    entrada = "entrada"
    salida = "salida"
    venta = "venta"
    ajuste = "ajuste"


# ---------------------------------------------------------
# TABLA: puntos_venta
# ---------------------------------------------------------
class PuntoVenta(Base):
    __tablename__ = "puntos_venta"

    id_punto_venta = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    ubicacion = Column(String(150))
    tipo = Column(String(50))


# ---------------------------------------------------------
# TABLA: usuarios
# ---------------------------------------------------------
class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100))
    contrasena = Column(String(255), nullable=False)
    rol = Column(String(20), nullable=False, default="vendedor")

    punto_venta_id = Column(Integer, ForeignKey("puntos_venta.id_punto_venta"))
    punto_venta = relationship("PuntoVenta")


# ---------------------------------------------------------
# TABLA: papel
# ---------------------------------------------------------
class Papel(Base):
    __tablename__ = "papel"

    paginas = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    stock_paginas = Column(Integer, nullable=False)


# ---------------------------------------------------------
# TABLA: libros
# ---------------------------------------------------------
class Libro(Base):
    __tablename__ = "libros"

    id_libro = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(150), nullable=False)
    categoria = Column(String(100))
    descripcion = Column(Text)
    precio = Column(DECIMAL(10, 2))
    paginas_por_libro = Column(Integer, ForeignKey("papel.paginas"), nullable=False)
    fecha_creacion = Column(DateTime, server_default=func.now(), nullable=False)

    papel = relationship("Papel")


# ---------------------------------------------------------
# TABLA: inventario_libros
# ---------------------------------------------------------
class InventarioLibro(Base):
    __tablename__ = "inventario_libros"

    id_inventario = Column(Integer, primary_key=True, autoincrement=True)
    libro_id = Column(Integer, ForeignKey("libros.id_libro"), nullable=False)
    stock = Column(Integer, nullable=False, default=0)

    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    libro = relationship("Libro")


# ---------------------------------------------------------
# TABLA: movimientos_libros
# ---------------------------------------------------------
class MovimientoLibro(Base):
    __tablename__ = "movimientos_libros"

    id_mov_libro = Column(Integer, primary_key=True, autoincrement=True)
    inventario_id = Column(Integer, ForeignKey("inventario_libros.id_inventario"), nullable=False)
    tipo = Column(Enum(TipoMovimiento), nullable=False)
    cantidad = Column(Integer, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id_usuario"))
    fecha_movimiento = Column(DateTime, server_default=func.now(), nullable=False)
    observaciones = Column(Text)

    inventario = relationship("InventarioLibro")
    usuario = relationship("Usuario")


# ---------------------------------------------------------
# TABLA: inventario_pv
# ---------------------------------------------------------
class InventarioPV(Base):
    __tablename__ = "inventario_pv"

    id_inventario = Column(Integer, primary_key=True, autoincrement=True)
    id_libro = Column(Integer, ForeignKey("libros.id_libro"), nullable=False)
    id_punto_venta = Column(Integer, ForeignKey("puntos_venta.id_punto_venta"), nullable=False)
    stock = Column(Integer, default=0)
    stock_minimo = Column(Integer, nullable=True)
    
    libro = relationship("Libro")
    punto_venta = relationship("PuntoVenta")

# ---------------------------------------------------------
# TABLA: materias_primas
# ---------------------------------------------------------


class MateriaPrima(Base):
    __tablename__ = "materias_primas"

    id_mp = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    unidad = Column(String(50), nullable=False)
    stock_actual = Column(Integer, default=0, nullable=False)
    stock_minimo = Column(Integer, default=0, nullable=False)
    movimientos = relationship("MovimientoMP", back_populates="materia_prima")

# ---------------------------------------------------------
# TABLA: movimientos_mp
# ---------------------------------------------------------

class MovimientoMP(Base):
    __tablename__ = "movimientos_mp"

    id_mov_mp = Column(Integer, primary_key=True, index=True)
    mp_id = Column(Integer, ForeignKey("materias_primas.id_mp"), nullable=False)
    tipo = Column(Enum("entrada", "salida", "ajuste", name="tipo_mov_mp"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True)
    fecha_movimiento = Column(DateTime, server_default=func.now(), nullable=False)
    observaciones = Column(Text)

    materia_prima = relationship("MateriaPrima", back_populates="movimientos")
    usuario = relationship("Usuario")
    
