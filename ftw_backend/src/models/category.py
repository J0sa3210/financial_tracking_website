from pydantic import BaseModel
from .counterpart import CounterpartView

class Category(BaseModel):
    id: int = None
    name: str = ""
    description: str = ""
    counterparts: list[str] = []

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CategoryCreate(BaseModel):
    name: str
    description: str = ""
    counterparts: list[str] = []

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CategoryView(BaseModel):
    id: int
    name: str
    description: str = ""
    counterparts: list[CounterpartView] = []

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CategoryEdit(BaseModel):
    name: str = None
    description: str = None
    counterparts: list[str] = None

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}