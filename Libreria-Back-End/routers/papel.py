from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Papel
from pydantic import BaseModel

router = APIRouter(prefix="/papel", tags=["Papel"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class PapelOut(BaseModel):
    paginas: int
    nombre: str

@router.get("/", response_model=list[PapelOut])
def listar_papel(db: Session = Depends(get_db)):
    return db.query(Papel).order_by(Papel.paginas).all()
