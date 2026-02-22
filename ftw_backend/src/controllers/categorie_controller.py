from fastapi import APIRouter, Depends, Header  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from typing import Annotated, Any
from database.schemas import CategorySchema
from models.category import CategoryView, CategoryCreate, CategoryEdit
from database import get_db
from services import CategoryService, AccountService, CounterpartService
from utils.logging import setup_loggers
from logging import Logger, DEBUG
from fastapi import HTTPException  # type: ignore
from datetime import datetime
from pydantic import BaseModel
from models.account import Account

# ======================================================================================================== #
#                                       SETUP FUNCTIONS
# ======================================================================================================== #

# ======================================================================================================== #
#                                       CREATE FUNCTIONS
# ======================================================================================================== #

# ======================================================================================================== #
#                                       GET FUNCTIONS
# ======================================================================================================== #

# ======================================================================================================== #
#                                       UPDATE FUNCTIONS
# ======================================================================================================== #

# ======================================================================================================== #
#                                       DELETE FUNCTIONS
# ======================================================================================================== #

logger: Logger = setup_loggers()
# logger.setLevel(DEBUG)

categorie_controller = APIRouter(
    prefix="/category",
)

category_service: CategoryService = CategoryService()
account_service: AccountService = AccountService()
counterpart_service: CounterpartService = CounterpartService()

# ======================================================================================================== #
#                                       CREATE FUNCTIONS
# ======================================================================================================== #

# Create a new category
@categorie_controller.post("", response_model=CategoryView)
def create_category(active_account_id: Annotated[str, Header()], category: CategoryCreate, db: Session = Depends(get_db)):
    # Check if the account exists
    owner: Account = account_service.get_account(db=db, account_id=int(active_account_id))
    category = category_service.add_category(new_category=category, owner=owner, db=db)
    db.commit()
    return category

# ======================================================================================================== #
#                                       GET FUNCTIONS
# ======================================================================================================== #
# Get all categories
@categorie_controller.get("", )
async def get_all_categories(active_account_id: Annotated[str, Header()], db: Session = Depends(get_db)):
    if active_account_id is None:
        logger.error(active_account)
        raise HTTPException(status_code=400, detail="Active account ID header is missing")
    # Check if the account exists
    active_account = account_service.get_account(db=db, account_id=int(active_account_id))
    owner_id: int = active_account.id
    
    result = category_service.get_all_categories(owner_id=owner_id, db=db)
    return result

# Get a certain category based on id
@categorie_controller.get("/{category_id}", response_model=CategoryView)
def get_category(active_account_id: Annotated[str, Header()], category_id: int, db: Session = Depends(get_db)):
    # Check if the account exists
    active_account = account_service.get_account(db=db, account_id=int(active_account_id))
    owner_id: int = active_account.id

    category = category_service.get_category(db=db, category_id=category_id, as_schema=True, owner_id=owner_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


    

# ======================================================================================================== #
#                                       UPDATE FUNCTIONS
# ======================================================================================================== #

# Update an existing category
@categorie_controller.put("/{category_id}", response_model=CategoryView)
def update_category(active_account_id: Annotated[str, Header()], category_id: int, updated_category: CategoryEdit, db: Session = Depends(get_db)):
    owner: Account = account_service.get_account(active_account_id, db)
    if owner is None:
        raise HTTPException(status_code=404, detail="Owner not found")

    current_category = db.query(CategorySchema).filter(CategorySchema.id == category_id).first()
    if not current_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    updated_category = category_service.update_category(current_category=current_category, updated_category=updated_category, owner=owner, db=db)
    db.commit()
    return updated_category

class AddCounterpartRequest(BaseModel):
    counterpart_name: str

# Add a counterpart to a category
@categorie_controller.post("/{category_id}/add_counterpart")
def add_counterpart_to_category(active_account_id: Annotated[str, Header()], category_id: int, payload: AddCounterpartRequest, db: Session = Depends(get_db)):
    # Check if the account exists
    active_account = account_service.get_account(db=db, account_id=int(active_account_id))
    if active_account is None:
        raise HTTPException(status_code=404, detail="Account not found")

    # Check if the category exists
    category = category_service.get_category(db=db, category_id=category_id, owner_id=active_account.id, as_schema=True)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check if the counterpart exists
    counterpart = counterpart_service.get_counterpart_by_name(db=db, name=payload.counterpart_name, owner_id=active_account.id)
    if counterpart is None:
        raise HTTPException(status_code=400, detail="Counterpart not found")

    # Add the counterpart to the category
    category_service.add_counterpart_to_category(db=db, category=category, counterpart=counterpart, owner_account=active_account)
    db.commit()

# Add transactions to the category
@categorie_controller.post("/{category_id}/add_transactions")
def add_transaciton_to_category(active_account_id: Annotated[str, Header()], category_id: int, payload: list[int], db: Session = Depends(get_db)):
    # Check if the account exists
    active_account = account_service.get_account(db=db, account_id=int(active_account_id))
    if active_account is None:
        raise HTTPException(status_code=404, detail="Account not found")

    # Check if the category exists
    category = category_service.get_category(db=db, category_id=category_id, owner_id=active_account.id, as_schema=True)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    category_service.add_transactions_to_category(db=db, category=category, transaction_ids=payload)
    db.commit()

# ======================================================================================================== #
#                                       DELETE FUNCTIONS
# ======================================================================================================== #

# Delete a caregoty
@categorie_controller.delete("/{category_id}", response_model=CategoryView)
def delete_category(active_account_id: Annotated[str, Header()], category_id: int, db: Session = Depends(get_db)):
    active_account = account_service.get_account(account_id=int(active_account_id), db=db)
    owner_id: int = active_account.id

    deleted_category = category_service.delete_category(category_id=category_id, db=db, owner_id=owner_id)
    db.commit()

    return deleted_category