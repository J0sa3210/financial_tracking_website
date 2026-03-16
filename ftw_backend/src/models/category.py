from pydantic import BaseModel
from .counterpart import CounterpartView, CounterpartEdit, CounterpartFromId
from .category_type import CategoryType

# ======================================================================================================== #
#                                       BASE CLASSES
# ======================================================================================================== #

class Category(BaseModel):
    id: int = None
    owner_id: int = None

    name: str = ""
    description: str = ""
    category_type: CategoryType
    counterparts: list[CounterpartView] = []

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CategoryCreate(BaseModel):
    owner_id: int = None

    name: str
    description: str = ""
    category_type: str | CategoryType

    counterparts: list[CounterpartEdit] = []

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CategoryView(BaseModel):
    id: int
    name: str
    description: str = ""
    category_type: CategoryType
    counterparts: list[CounterpartView] = []

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CategoryEdit(BaseModel):
    id: int

    name: str
    description: str = None
    category_type: CategoryType
    
    counterparts: list[CounterpartFromId] = []

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}
