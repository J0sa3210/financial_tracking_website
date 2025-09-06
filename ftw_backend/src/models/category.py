from pydantic import BaseModel
from .counterpart import CounterpartView, CounterpartEdit
from .transaction import TransactionView

class Category(BaseModel):
    id: int = None
    owner_id: int = None
    name: str = ""
    description: str = ""
    counterparts: list[CounterpartView] = []
    transactions: list[TransactionView] = []

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CategoryCreate(BaseModel):
    name: str
    owner_id: int = None
    description: str = ""
    counterparts: list[CounterpartEdit] = []

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CategoryView(BaseModel):
    id: int
    name: str
    description: str = ""
    counterparts: list[CounterpartView] = []
    transactions: list[TransactionView] = []

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CategoryEdit(BaseModel):
    id: int
    name: str
    description: str = None
    counterparts: list[CounterpartEdit] = []

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}
