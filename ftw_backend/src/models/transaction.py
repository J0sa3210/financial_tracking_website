from pydantic import BaseModel
from enum import StrEnum
from datetime import date
from typing import List, Optional

class TransactionTypes(StrEnum):
    EXPENSES: str = "Expenses"
    INCOME: str = "Income"
    SAVINGS: str = "Savings",
    NONE: str = "None"

class Transaction(BaseModel):
    id: int
    transaction_type: TransactionTypes = TransactionTypes.NONE
    category_id: Optional[int]
    category_name: Optional[str] = None

    owner_account_number: str = ""
    counterpart_name: str = ""
    counterpart_account_number: str = ""

    value: float
    date_executed: date
    description: Optional[str]

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}


class TransactionCreate(BaseModel):
    transaction_type: TransactionTypes = TransactionTypes.NONE
    category_id: Optional[int] = None
    category_name: Optional[str] = None

    owner_account_number: str
    counterpart_name: str
    counterpart_account_number: str

    value: float
    date_executed: date
    description: Optional[str] = ""

    model_config = {'from_attributes': True}

class TransactionEdit(BaseModel):
    transaction_type: TransactionTypes = TransactionTypes.NONE
    category_id: Optional[int] = None 

    date_executed: Optional[date] = None
    description: Optional[str] = None

    model_config = {'from_attributes': True}

class TransactionView(BaseModel):
    id: int
    transaction_type: TransactionTypes
    category_id: Optional[int]
    category_name: Optional[str]

    owner_account_number: str
    counterpart_name: str
    counterpart_account_number: str

    value: float
    date_executed: date
    description: Optional[str]

    model_config = {'from_attributes': True}
