from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from typing import Annotated
from database.schemas import CategorySchema
from models.category import CategoryView, CategoryCreate, CategoryEdit
from database import get_db
from services import CategoryService, AccountService
from utils.logging import setup_loggers
from logging import Logger, DEBUG
from fastapi import HTTPException

# TODO: filter get categories by owner_id


logger: Logger = setup_loggers()
# logger.setLevel(DEBUG)

categorie_controller = APIRouter(
    prefix="/categories",
)

category_service: CategoryService = CategoryService()
account_service: AccountService = AccountService()

@categorie_controller.get("", )
async def get_all_categories(active_account_id: Annotated[str, Header()], db: Session = Depends(get_db)):
    # Check if the account exists
    active_account = account_service.get_account(db=db, account_id=int(active_account_id))
    owner_id: int = active_account.id
    
    result = category_service.get_all_categories(owner_id=owner_id, db=db)
    return result

# Create a new category
@categorie_controller.post("", response_model=CategoryView)
def create_category(active_account_id: Annotated[str, Header()], category: CategoryCreate, db: Session = Depends(get_db)):
    # Check if the account exists
    active_account = account_service.get_account(db=db, account_id=int(active_account_id))
    owner_id: int = active_account.id
    
    
    category = category_service.add_category(new_category=category, owner_id=owner_id, db=db)
    return category

# Update an existing category
@categorie_controller.put("/{category_id}", response_model=CategoryView)
def update_category(category_id: int, category: CategoryEdit, db: Session = Depends(get_db)):
    logger.debug(f"Category to update: {category}")
    updated_category = category_service.update_category(category_id=category_id, updated_category=category, db=db)
    return updated_category

@categorie_controller.delete("/{category_id}", response_model=CategoryView)
def delete_category(active_account_id: Annotated[str, Header()], category_id: int, db: Session = Depends(get_db)):
    active_account = account_service.get_account(db=db, account_id=int(active_account_id))
    owner_id: int = active_account.id

    deleted_category = category_service.delete_category(category_id=category_id, db=db, owner_id=owner_id)
    
    return deleted_category

# Get all names for a category
@categorie_controller.get("/{category_id}/counterparts", response_model=list[str])
def read_names(active_account_id: Annotated[str, Header()], category_id: int, db: Session = Depends(get_db)):
     # Check if the account exists
    active_account = account_service.get_account(db=db, account_id=int(active_account_id))
    owner_id: int = active_account.owner_id
    
    
    category = category_service.get_category(db=db, category_id=category_id, owner_id=owner_id)

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return [counterpart.name for counterpart in category.counterparts]
