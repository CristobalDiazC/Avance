"""
Punto de entrada principal de la API de librería.

Este módulo:
- Inicializa la aplicación FastAPI.
- Crea las tablas en la base de datos (si no existen).
- Registra los routers de:
    - libros
    - inventario
    - movimientos
- Expone la dependencia `get_db` para obtener una sesión de base de datos por petición.
- Define algunas rutas simples de ejemplo ("/" y "/libros/").
"""
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from routers import libros, inventario, movimientos, usuarios, puntos_venta, inventario_pv, materias_primas
from fastapi.middleware.cors import CORSMiddleware
from models import Usuario

app = FastAPI(title="API Librería")


# ============================================================
# USUARIO ADMIN AUTOMÁTICO
# ============================================================
@app.on_event("startup")
def crear_usuario_admin():
    db = SessionLocal()
    try:
        hay_usuarios = db.query(Usuario).first()

        if not hay_usuarios:
            admin = Usuario(
                nombre="Administrador",
                email="admin@admin.com",
                contrasena="admin",
                rol="admin",
                punto_venta_id=None
            )
            db.add(admin)
            db.commit()
            print("✔ Usuario admin/admin creado automáticamente")
        else:
            print("✔ Usuarios existentes detectados, no se crea admin")
    finally:
        db.close()


# ============================================================
# CONFIGURACIÓN CORS CORRECTA
# ============================================================
# SOLO permitimos tu frontend y backend (esto es lo correcto)
origins = [
    "http://127.0.0.1:5500",   # Live Server
    "http://localhost:5500",
    "http://127.0.0.1:8000",   # Backend (docs, testing)
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,     # <─ AHORA SÍ usamos origins
    allow_credentials=True,
    allow_methods=["*"],       # Permite GET, POST, PUT, DELETE
    allow_headers=["*"],       # Permite Content-Type, Authorization, etc.
)


# ============================================================
# CREAR TABLAS
# ============================================================
Base.metadata.create_all(bind=engine)


# ============================================================
# REGISTRO DE ROUTERS
# ============================================================
app.include_router(libros.router)
app.include_router(inventario.router)
app.include_router(movimientos.router)
app.include_router(usuarios.router)
app.include_router(puntos_venta.router)
app.include_router(inventario_pv.router)
app.include_router(materias_primas.router)


# ============================================================
# RUTA BASE
# ============================================================
@app.get("/")
def root():
    return {"message": "Bienvenido a la API de Librería"}
