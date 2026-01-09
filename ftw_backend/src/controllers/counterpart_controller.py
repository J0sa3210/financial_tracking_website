from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from typing import Annotated
from database.schemas import CounterpartSchema
from models.counterpart import CounterpartCreate
from services.counterpart_service import CounterpartService
from database import get_db
from utils.logging import setup_loggers
from logging import Logger

logger: Logger = setup_loggers()
counterpart_service: CounterpartService = CounterpartService()
counterpart_controller = APIRouter(
    prefix="/counterparts",
)

@counterpart_controller.get("")
def get_all_counterparts(active_account_id: Annotated[str, Header()], db: Session = Depends(get_db)):
    """
    Get all counterparts.
    """
    counterparts = counterpart_service.get_all_counterparts(db, owner_id=int(active_account_id))
    return counterparts

@counterpart_controller.get("/names")
def get_counterpart_names(active_account_id: Annotated[str, Header()], db: Session = Depends(get_db)):
    """
    Get all counterpart names.
    """
    names = counterpart_service.get_counterpart_names(db, owner_id=int(active_account_id))
    return names

@counterpart_controller.get("/empty")
def get_empty_counterparts(active_account_id: Annotated[str, Header()], db: Session = Depends(get_db)):
    """
    Get all empty counterparts.
    """
    counterparts = counterpart_service.get_empty_counterparts(db, owner_id=int(active_account_id))
    return counterparts

# Create a new counterpart for a category
@counterpart_controller.post("")
def create_counterpart(active_account_id: Annotated[str, Header()], counterpart: CounterpartCreate, db: Session = Depends(get_db)):
    db_counterpart = counterpart_service.create_counterpart(counterpart, db, owner_id=int(active_account_id))
    return db_counterpart