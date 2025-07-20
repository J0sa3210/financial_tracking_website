from pydantic import BaseModel
from enum import StrEnum
from datetime import date, time
class TransactionTypes(StrEnum):
    EXPENSES: str = "Expenses"
    INCOME: str = "Income"
    SAVINGS: str = "Savings",
    NONE: str = "None"


class Transaction(BaseModel):
    id: int = None
    transaction_type: TransactionTypes = TransactionTypes.NONE
    value: int = 0
    date_executed: date = "1990-01-01"
    time_executed: time = "00:00:00"
    description: str = ""

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class TransactionEdit(BaseModel):
    transaction_type: TransactionTypes = None
    value: int = None
    date_executed: str = None
    time_executed: str = None
    description: str = None

    model_config = {'from_attributes': True}
 