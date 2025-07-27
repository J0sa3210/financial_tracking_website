from pydantic import BaseModel
from enum import StrEnum
from datetime import date, time
class TransactionTypes(StrEnum):
    EXPENSES: str = "Expenses"
    INCOME: str = "Income"
    SAVINGS: str = "Savings",
    NONE: str = "None"

class TransactionCategories(StrEnum):
    FOOD: str = "Food"
    TRANSPORT: str = "Transport"
    ENTERTAINMENT: str = "Entertainment"
    UTILITIES: str = "Utilities"
    HEALTH: str = "Health"
    CLOTHING: str = "Clothing"
    MISCELLANEOUS: str = "Miscellaneous"
    NONE: str = "None"

class Transaction(BaseModel):
    id: int = None
    transaction_type: TransactionTypes = TransactionTypes.NONE
    transaction_category: TransactionCategories = TransactionCategories.NONE

    transaction_owner_account_number: str = ""
    transaction_counterpart_name: str = ""
    transaction_counterpart_account_number: str = ""

    value: int = 0
    date_executed: date = "1990-01-01"
    
    description: str = ""

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class TransactionEdit(BaseModel):
    transaction_type: TransactionTypes = TransactionCategories.NONE
    transaction_category: TransactionCategories = TransactionCategories.NONE

    transaction_owner_account_number: str = ""
    transaction_counterpart_name: str = ""
    transaction_counterpart_account_number: str = ""

    value: int = None
    date_executed: str = None

    description: str = None

    model_config = {'from_attributes': True}
 