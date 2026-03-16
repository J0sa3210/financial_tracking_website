from pydantic import BaseModel
from enum import StrEnum
from datetime import date
from typing import List, Optional
from .counterpart import Counterpart, CounterpartView
from .category import Category
from decimal import Decimal

# ======================================================================================================== #
#                                       BASE CLASSES
# ======================================================================================================== #

class Transaction(BaseModel):
    id: int
    
    value: Decimal
    description: Optional[str]
    date_executed: date
    owner_iban: str = ""

    counterpart_id: Optional[int] = None
    counterpart: Optional[Counterpart] = None

    category_id: Optional[int]
    category: Optional[Category]

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}


class TransactionCreate(BaseModel):
    category_id: Optional[int] = None

    owner_iban: str
    counterpart_id: Optional[int] = None

    value: Decimal
    date_executed: date
    description: Optional[str] = ""

    model_config = {'from_attributes': True}

class TransactionEdit(BaseModel):
    
    category_id: Optional[int] = None 
    counterpart_id: Optional[int] = None
    date_executed: Optional[date] = None
    description: Optional[str] = None

    model_config = {'from_attributes': True}

class TransactionTableView(BaseModel):
    id: int

    category_id: Optional[int] = None
    category_name: Optional[str] = None
    category_type_name: Optional[str] = None

    counterpart_id: Optional[int] = None
    counterpart: Optional[CounterpartView] = None

    owner_iban: str

    value: Decimal
    date_executed: date
    description: Optional[str] = None

    @classmethod
    def from_schema(cls, t) -> "TransactionTableView":
        return cls(
            id=t.id,

            category_id=t.category.id if t.category else None,
            category_name=t.category.name if t.category else None,
            category_type_name=t.category.category_type.name if t.category else None,

            counterpart_id=t.counterpart_id,
            counterpart=CounterpartView.model_validate(t.counterpart) if t.counterpart else None,

            owner_iban=t.owner_iban,

            value=t.value,
            date_executed=t.date_executed,
            description=t.description,
        )