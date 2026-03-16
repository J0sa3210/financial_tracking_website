from dataclasses import dataclass, field
from sqlalchemy.orm import Session  # type: ignore
from .category_type import CategoryType
from database.schemas import CategorySchema, TransactionSchema
from typing import Any

@dataclass
class CategorySummary:
    category_name: str = ""
    category_amount: int = 0

@dataclass
class MonthOverview:
    category_type: CategoryType = ""
    type_overview: list[CategorySummary] = field(default_factory=list)

@dataclass
class YearOverview:
    year_overview: list[dict[str, Any]] = field(default_factory=list)