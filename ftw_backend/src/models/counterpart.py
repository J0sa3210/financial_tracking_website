from pydantic import BaseModel
from typing import Optional

class Counterpart(BaseModel):
    id: int = None
    name: str = ""
    owner_id: int = None
    category_id: Optional[int] = None
    n_transactions: int = 0

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CounterpartCreate(BaseModel):
    name: str
    owner_id: int
    category_id: int = None

class CounterpartEdit(BaseModel):
    id: int 
    name: str 
    category_id: Optional[int] = None

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CounterpartView(BaseModel):
    id: int
    name: str
    
    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}