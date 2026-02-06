from dataclasses import dataclass, field
from sqlalchemy.orm import Session  # type: ignore
from models.transaction import TransactionTypes
from models.type_overview import CategorySummary, MonthOverview, YearOverview
from database.schemas import CategorySchema, TransactionSchema
from datetime import date
from typing import Any
from sqlalchemy import extract
from utils.logging import setup_loggers




class TypeService():
    def __init__(self):
        self.logger = setup_loggers()

     # Go over all categories with the type_name matching this type and create CategorySummary
    def get_type_month_breakdown(self, type_name: TransactionTypes, db: Session, year: int | None = None, month: int | None = None):
        categories: list[CategorySchema] = db.query(CategorySchema).filter(CategorySchema.category_type == type_name).all()

        category_overview: list[CategorySummary] = []
        for c in categories:
            category_amount: int = 0

            tx: TransactionSchema
            for tx in c.transactions:
                execution_date: date = tx.date_executed

                if execution_date.year == year: 
                    if month == 0 or execution_date.month == month:
                        category_amount += tx.value

            if c.category_type == TransactionTypes.EXPENSES or c.category_type == TransactionTypes.SAVINGS:
                category_amount = -category_amount

            # Round the total amount
            category_amount = round(category_amount, 2)

            category_overview.append(CategorySummary(category_name=c.name, category_amount=category_amount))

        # Order catergory summary list
        category_overview.sort(key = lambda summary: summary.category_amount, reverse=True)

        return MonthOverview(type_name=type_name, type_overview=category_overview)

    def get_year_overview(self, year: int, db: Session):
        months_str: list[str] = ["January", "Februari", "March", "April", "May", "June", "Juli", "August", "September","October", "November", "December"]
        year_overview: list[dict[str, Any]] = []

        # For each month:
        for month in range(1,13):
            # Get all transactions in that year and month
            txs: list[TransactionSchema] = db.query(TransactionSchema).filter(
                extract('year', TransactionSchema.date_executed) == year,
                extract('month', TransactionSchema.date_executed) == month
            ).all()

            # self.logger.debug(f"Creating overview for month {month}")
            month_name: str = months_str[month-1]

            # Create initial overview
            
            month_overview: dict[str, Any] = {"month": month_name}
            for tx_type in TransactionTypes:
                if tx_type is not TransactionTypes.NONE:
                    month_overview[tx_type] = 0
            
            # For all transactions:
            for tx in txs:
                tx_type: TransactionTypes = tx.transaction_type
                
                if tx_type is not TransactionTypes.NONE:
                    month_overview[tx_type] += tx.value

            month_overview[TransactionTypes.EXPENSES] = -month_overview[TransactionTypes.EXPENSES]
            month_overview[TransactionTypes.SAVINGS] = -month_overview[TransactionTypes.SAVINGS]
            year_overview.append(month_overview)

        return YearOverview(year_overview=year_overview)

