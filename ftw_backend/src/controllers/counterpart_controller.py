from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from typing import Annotated
from database.schemas import CounterpartSchema
from models.counterpart import CounterpartCreate
from services import CounterpartService, AccountService, CategoryService
from database import get_db
from utils.logging import setup_loggers
from logging import Logger
from fastapi import HTTPException

# ======================================================================================================== #
#                                       SETUP FUNCTIONS
# ======================================================================================================== #

logger: Logger = setup_loggers()
counterpart_service: CounterpartService = CounterpartService()
category_service: CategoryService = CategoryService()
account_service: AccountService = AccountService()
counterpart_controller = APIRouter(
    prefix="/counterpart",
)

# ======================================================================================================== #
#                                       GET FUNCTIONS
# ======================================================================================================== #

# Get all counterparts
@counterpart_controller.get("")
def get_all_counterparts(active_account_id: Annotated[str, Header()], db: Session = Depends(get_db)):
    """
    Get all counterparts.
    """
    counterparts = counterpart_service.get_all_counterparts(db, owner_id=int(active_account_id))
    return counterparts

# Get all counterparts for a category
@counterpart_controller.get("/{category_id}/counterparts", response_model=list[str])
def read_names(active_account_id: Annotated[str, Header()], category_id: int, db: Session = Depends(get_db)):
     # Check if the account exists
    active_account = account_service.get_account(db=db, account_id=int(active_account_id))
    owner_id: int = active_account.owner_id
    
    category = category_service.get_category(db=db, category_id=category_id, owner_id=owner_id)

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return [counterpart.name for counterpart in category.counterparts]

# Get all counterpart names
@counterpart_controller.get("/names")
def get_counterpart_names(active_account_id: Annotated[str, Header()], db: Session = Depends(get_db)):
    """
    Get all counterpart names.
    """
    names = counterpart_service.get_counterpart_names(db, owner_id=int(active_account_id))
    return names

# Get all counterparts that don't have a category
@counterpart_controller.get("/empty")
def get_empty_counterparts(active_account_id: Annotated[str, Header()], db: Session = Depends(get_db)):
    """
    Get all empty counterparts.
    """
    counterparts = counterpart_service.get_empty_counterparts(db, owner_id=int(active_account_id))
    return counterparts

# ======================================================================================================== #
#                                       CREATE FUNCTIONS
# ======================================================================================================== #

# Create a new counterpart for a category
@counterpart_controller.post("")
def create_counterpart(active_account_id: Annotated[str, Header()], counterpart: CounterpartCreate, db: Session = Depends(get_db)):
    db_counterpart = counterpart_service.create_counterpart(counterpart, db, owner_id=int(active_account_id))
    db.commit()
    return db_counterpart