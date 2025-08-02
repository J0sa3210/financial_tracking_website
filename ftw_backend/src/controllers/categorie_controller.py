from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import Annotated
from database.schemas import CategorySchema
from models.category import CategoryView, CategoryCreate, CategoryEdit
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
@categorie_controller.post("/", response_model=CategoryView)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    category = categoryService.add_category(new_category=category, db=db)
    return category

# Update an existing category
@categorie_controller.put("/{category_id}", response_model=CategoryView)
def update_category(category_id: int, category: CategoryEdit, db: Session = Depends(get_db)):
    existing_category = db.query(CategorySchema).filter(CategorySchema.id == category_id).first()
    if not existing_category:
        raise HTTPException(status_code=404, detail="Category not found")
    updated_category = categoryService.convert_category_data(existing_category, category, db)
    db.commit()
    db.refresh(updated_category)
    return updated_category

# Get all names for a category
@categorie_controller.get("/{category_id}/counterparts/", response_model=list[str])
def read_names(category_id: int, db: Session = Depends(get_db)):
    category = db.query(CategorySchema).filter(CategorySchema.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return [counterpart.name for counterpart in category.counterparts]
