from pydantic import BaseModel

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