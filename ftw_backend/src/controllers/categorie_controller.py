from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import Annotated
from database.schemas import CategorySchema, CounterpartSchema
from models.category import Category, CategoryCreate, CounterpartCreate
from database import get_db
from services import CategoryService
from utils.logging import setup_loggers
from logging import Logger
from fastapi import HTTPException

logger: Logger = setup_loggers()

categorie_controller = APIRouter(
    prefix="/categories",
)

categoryService: CategoryService = CategoryService()

@categorie_controller.get("/", )
async def get_all_categories(db: Session = Depends(get_db)):
    result = categoryService.get_all_categories(db=db)
    return result

# Create a new category
@categorie_controller.post("/", response_model=Category)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    category = categoryService.add_category(new_category=category, db=db)
    return category

# Create a new counterpart for a category
@categorie_controller.post("/counterparts/", response_model=CounterpartCreate)
def create_counterpart(counterpart: CounterpartCreate, db: Session = Depends(get_db)):
    db_counterpart = CounterpartSchema(name=counterpart.name, category_id=counterpart.category_id)
    db.add(db_counterpart)
    db.commit()
    db.refresh(db_counterpart)
    return db_counterpart


# Get all names for a category
@categorie_controller.get("/{category_id}/counterparts/", response_model=list[str])
def read_names(category_id: int, db: Session = Depends(get_db)):
    category = db.query(CategorySchema).filter(CategorySchema.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return [counterpart.name for counterpart in category.counterparts]