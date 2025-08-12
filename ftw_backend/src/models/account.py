from pydantic import BaseModel

class Account(BaseModel):
    id: int
    name: str
    bank_account: str

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class AccountCreate(BaseModel):
    name: str
    bank_account: str

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class AccountView(BaseModel):
    id: int
    name: str
    bank_account: str

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}