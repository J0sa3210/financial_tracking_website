from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.schemas import CounterpartSchema
from models.counterpart import CounterpartCreate
from database import get_db
from utils.logging import setup_loggers
from logging import Logger

logger: Logger = setup_loggers()

counterpart_controller = APIRouter(
    prefix="/counterparts",
)

@counterpart_controller.get("/")
def get_all_counterparts(db: Session = Depends(get_db)):
    """
    Get all counterparts.
    """
    counterparts = db.query(CounterpartSchema).all()
    return counterparts

# Create a new counterpart for a category
@counterpart_controller.post("/")
def create_counterpart(counterpart: CounterpartCreate, db: Session = Depends(get_db)):
    db_counterpart = CounterpartSchema(name=counterpart.name, category_id=counterpart.category_id)
    db.add(db_counterpart)
    db.commit()
    db.refresh(db_counterpart)
    return db_counterpart