from pydantic import BaseModel

class Counterpart(BaseModel):
    id: int = None
    name: str = ""
    category_id: int = None

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CounterpartCreate(BaseModel):
    name: str
    category_id: int

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