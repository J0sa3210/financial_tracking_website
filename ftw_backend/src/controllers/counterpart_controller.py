from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from typing import Annotated
from database.schemas import CounterpartSchema
from models.counterpart import CounterpartCreate
from database import get_db
from utils.logging import setup_loggers
from logging import Logger

logger: Logger = setup_loggers()

counterpart_controller = APIRouter(
    prefix="/counterparts",
)

@counterpart_controller.get("")
def get_all_counterparts(active_account_id: Annotated[str, Header()], db: Session = Depends(get_db)):
    """
    Get all counterparts.
    """
    counterparts = db.query(CounterpartSchema).filter(active_account_id == CounterpartSchema.owner_id).all()
    return counterparts

@counterpart_controller.get("/names")
def get_counterpart_names(active_account_id: Annotated[str, Header()], db: Session = Depends(get_db)):
    """
    Get all counterpart names.
    """
    counterparts = db.query(CounterpartSchema.name).filter(active_account_id == CounterpartSchema.owner_id).all()
    return [counterpart.name for counterpart in counterparts]

# Create a new counterpart for a category
@counterpart_controller.post("")
def create_counterpart(active_account_id: Annotated[str, Header()], counterpart: CounterpartCreate, db: Session = Depends(get_db)):
    db_counterpart = CounterpartSchema(name=counterpart.name, category_id=counterpart.category_id, owner_id=int(active_account_id))
    db.add(db_counterpart)
    db.commit()
    db.refresh(db_counterpart)
    return db_counterpart