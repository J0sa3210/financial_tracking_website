from pydantic import BaseModel

class Counterpart(BaseModel):
    id: int = None
    name: str = ""
    category_id: int = None

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CounterpartCreate(BaseModel):
    name: str
    category_id: int = None
