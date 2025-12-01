"""
Módulo de configuración de la base de datos.

Se encarga de:
- Cargar las variables de entorno desde un archivo .env.
- Validar que las variables necesarias estén presentes.
- Construir la URL de conexión a MySQL.
- Crear el `engine` de SQLAlchemy.
- Exponer `SessionLocal` para crear sesiones a la BD.
- Exponer `Base` para declarar los modelos ORM.

Este módulo está pensado para ser importado desde el resto de la aplicación, por ejemplo:
    from database import SessionLocal, Base
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv, find_dotenv
from typing import Generator 
import os
from pathlib import Path
from typing import Generator

# Cargar .env
env_path = find_dotenv(usecwd=True) or str(Path(__file__).parent / ".env")
load_dotenv(dotenv_path=env_path)

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = os.getenv("DB_PORT", "3306")

# Validación de variables
missing = [k for k, v in {
    "DB_HOST": DB_HOST, "DB_USER": DB_USER, "DB_PASSWORD": DB_PASSWORD,
    "DB_NAME": DB_NAME, "DB_PORT": DB_PORT
}.items() if not v]
if missing:
    raise RuntimeError(f"Variables .env faltantes: {', '.join(missing)}. "
                       f"Revisá tu archivo .env en: {env_path}")

# Cadena de conexión 
DATABASE_URL = (
    f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    "?auth_plugin=mysql_native_password"
)

# Crea engine y sesión
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,           
    pool_recycle=280            
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependencia de FastAPI para obtener sesión de DB
def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()