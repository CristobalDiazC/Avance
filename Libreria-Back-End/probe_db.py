from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    row = conn.execute(text("SELECT DATABASE(), 1")).fetchone()
    print("Conectado a:", row)