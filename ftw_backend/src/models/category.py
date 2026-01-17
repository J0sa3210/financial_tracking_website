from pydantic import BaseModel
from .counterpart import CounterpartView, CounterpartEdit, CounterpartFromId
from .transaction import TransactionView, TransactionTypes

class Category(BaseModel):
    id: int = None
    owner_id: int = None

    name: str = ""
    description: str = ""
    category_type: TransactionTypes = TransactionTypes.NONE 
    
    counterparts: list[CounterpartView] = []
    transactions: list[TransactionView] = []

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CategoryCreate(BaseModel):
    owner_id: int = None

    name: str
    description: str = ""
    category_type: TransactionTypes = TransactionTypes.NONE

    counterparts: list[CounterpartEdit] = []

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CategoryView(BaseModel):
    id: int
    
    name: str
    description: str = ""
    category_type: TransactionTypes = TransactionTypes.NONE
    
    counterparts: list[CounterpartView] = []
    transactions: list[TransactionView] = []

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CategoryEdit(BaseModel):
    id: int

    name: str
    description: str = None
    category_type: TransactionTypes = None
    
    counterparts: list[CounterpartFromId] = []

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}
