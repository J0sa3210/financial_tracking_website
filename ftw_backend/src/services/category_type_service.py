from dataclasses import dataclass, field
from sqlalchemy.orm import Session  # type: ignore
from models.category_type import CategoryType
from models.type_overview import CategorySummary, MonthOverview, YearOverview
from database.schemas import CategorySchema, TransactionSchema, AccountSchema, CategoryTypeSchema
from .category_service import CategoryService
from .account_service import AccountService
from datetime import date
from typing import Any
from sqlalchemy import extract
from utils.logging import setup_loggers





class CategoryTypeService():
    def __init__(self):
        self.logger = setup_loggers()
        self.category_service: CategoryService = CategoryService() 
        self.account_service: AccountService = AccountService()

    def get_all_category_types(self, active_account: AccountSchema, db: Session):
        category_types: list[CategoryTypeSchema] = db.query(CategoryTypeSchema).filter(
            CategoryTypeSchema.owner_id == active_account.id
        ).all()

        return category_types
    
    def get_category_type_by_name(self, name: str, db: Session, as_schema: bool = False):
        category_type: CategoryTypeSchema = db.query(CategoryTypeSchema).filter(
            CategoryTypeSchema.name == name
        ).first()

        if not as_schema:
            print(category_type.__dict__)
            return CategoryType.model_validate(category_type)

        return category_type

     # Go over all categories with the type_name matching this type and create CategorySummary
    def get_type_month_breakdown(self, active_account: AccountSchema, type_name: str, db: Session, year: int | None = None, month: int | None = None):
        categories: list[CategorySchema] = self.category_service.get_all_categories_of_type(type_name=type_name, db=db, owner_id=active_account.id)

        category_overview: list[CategorySummary] = []
        
        c: CategorySchema
        for c in categories:
            category_amount: int = 0

            tx: TransactionSchema
            for tx in c.transactions:
                execution_date: date = tx.date_executed

                if execution_date.year == year: 
                    if month == 0 or execution_date.month == month:
                        category_amount += tx.value

            category_type: CategoryTypeSchema = c.category_type
            if not category_type.is_positive:
                category_amount = -category_amount

            # Round the total amount
            category_amount = round(category_amount, 2)

            category_overview.append(CategorySummary(category_name=c.name, category_amount=category_amount))

        # Order catergory summary list
        category_overview.sort(key = lambda summary: summary.category_amount, reverse=True)

        return MonthOverview(type_name=type_name, type_overview=category_overview)

    def get_year_overview(self, year: int, db: Session, active_account: AccountSchema):
        months_str: list[str] = ["January", "Februari", "March", "April", "May", "June", "Juli", "August", "September","October", "November", "December"]
        year_overview: list[dict[str, Any]] = []

        active_iban: str = self.account_service.format_IBAN(active_account.iban)

        # For each month:
        for month in range(1,13):
            # Get all transactions in that year and month
            txs: list[TransactionSchema] = db.query(TransactionSchema).filter(
                TransactionSchema.owner_iban==active_iban,
                extract('year', TransactionSchema.date_executed) == year,
                extract('month', TransactionSchema.date_executed) == month
            ).all()

            # self.logger.debug(f"Creating overview for month {month}")
            month_name: str = months_str[month-1]

            # Create initial overview
            
            month_overview: dict[str, Any] = {"month": month_name}
            for c_type in CategoryTypeSchema:
                month_overview[c_type.name] = 0
            
            # For all transactions:
            for tx in txs:
                c: CategorySchema = tx.category
                c_type: CategoryTypeSchema = c.category_type
                if c_type.is_positive:
                    month_overview[c_type.name] += tx.value
                else:
                    month_overview[c_type.name] -= tx.value
                    
            year_overview.append(month_overview)

        return YearOverview(year_overview=year_overview)

