from dataclasses import dataclass, field
from sqlalchemy.orm import Session  # type: ignore
from .transaction import TransactionTypes
from database.schemas import CategorySchema, TransactionSchema
from typing import Any

@dataclass
class CategorySummary:
    category_name: str = ""
    category_amount: int = 0

@dataclass
class MonthOverview:
    type_name: TransactionTypes = TransactionTypes.NONE
    type_overview: list[CategorySummary] = field(default_factory=list)

@dataclass
class YearOverview:
    year_overview: list[dict[str, Any]] = field(default_factory=list)