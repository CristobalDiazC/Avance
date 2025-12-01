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
from routers import libros, inventario, movimientos, usuarios, puntos_venta, inventario_pv,materias_primas
from fastapi.middleware.cors import CORSMiddleware
from models import Usuario

app = FastAPI(title="API Librería")

@app.on_event("startup")
def crear_usuario_admin():
    db = SessionLocal()
    try:
        # ¿Existe algún usuario ya?
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

# CORS origins solo, se utiliza en producción o en desarrollo pero bajo NGINX
origins = [
    "http://127.0.0.1:5500",  # por ejemplo si usas Live Server
    "http://localhost:5500",
    "http://127.0.0.1:8000",  # si sirves HTML con FastAPI
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],# Para desarrollo es mejor "*" no -> origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crea tablas
Base.metadata.create_all(bind=engine)

# Rutas
app.include_router(libros.router)
app.include_router(inventario.router)
app.include_router(movimientos.router)
app.include_router(usuarios.router)
app.include_router(puntos_venta.router)
app.include_router(inventario_pv.router)
app.include_router(materias_primas.router)



@app.get("/")
def root():
    return {"message": "Bienvenido a la API de Librería"}