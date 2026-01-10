from pydantic import BaseModel
from enum import StrEnum
from datetime import date
from typing import List, Optional
from .counterpart import Counterpart

class TransactionTypes(StrEnum):
    EXPENSES: str = "Expenses"
    INCOME: str = "Income"
    SAVINGS: str = "Savings"
    NONE: str = "None"

class Transaction(BaseModel):
    id: int
    transaction_type: TransactionTypes = TransactionTypes.NONE
    category_id: Optional[int]
    category_name: Optional[str] = None

    owner_iban: str = ""
    counterpart_name: str = ""
    counterpart_id: int
    counterpart: Counterpart

    value: float
    date_executed: date
    description: Optional[str]

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}


class TransactionCreate(BaseModel):
    transaction_type: TransactionTypes = TransactionTypes.NONE
    category_id: Optional[int] = None
    category_name: Optional[str] = None

    owner_iban: str
    counterpart_name: str = ""
    counterpart_id: int

    value: float
    date_executed: date
    description: Optional[str] = ""

    model_config = {'from_attributes': True}

class TransactionEdit(BaseModel):
    transaction_type: TransactionTypes = TransactionTypes.NONE
    category_id: Optional[int] = None 
    counterpart_id: int
    date_executed: Optional[date] = None
    description: Optional[str] = None

    model_config = {'from_attributes': True}

class TransactionView(BaseModel):
    id: int
    transaction_type: TransactionTypes
    category_id: Optional[int]
    category_name: Optional[str]

    owner_iban: str
    counterpart_name: str
    counterpart_id: int

    value: float
    date_executed: date
    description: Optional[str]

    model_config = {'from_attributes': True}
