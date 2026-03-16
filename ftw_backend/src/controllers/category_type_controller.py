from fastapi import APIRouter, Depends, Header  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from typing import Annotated, Any
from database.schemas import CategorySchema
from models.category import CategoryView, CategoryCreate, CategoryEdit
from database import get_db
from services import CategoryService, AccountService, CounterpartService, CategoryTypeService
from utils.logging import setup_loggers
from logging import Logger, DEBUG
from fastapi import HTTPException  # type: ignore
from datetime import datetime
from pydantic import BaseModel
from models.account import Account
from database.schemas import CategoryTypeSchema
from exceptions.exceptions import AccountNotFoundException
from models.type_overview import YearOverview, MonthOverview

logger: Logger = setup_loggers()
# logger.setLevel(DEBUG)

category_type_controller = APIRouter(
    prefix="/type",
)

category_service: CategoryService = CategoryService()
account_service: AccountService = AccountService()
counterpart_service: CounterpartService = CounterpartService()
category_type_service: CategoryTypeService = CategoryTypeService()

@category_type_controller.get("/overview/month/all")
def get_type_overview(active_account_id: Annotated[str, Header()], db: Session = Depends(get_db), year: int | None = None, month: int | None = None) -> list[MonthOverview]:
    # Check if the account exists
    active_account = account_service.get_account(db=db, account_id=int(active_account_id))

    if not active_account:
        raise AccountNotFoundException(active_account_id)

    category_types: list[CategoryTypeSchema] = category_type_service.get_all_category_types(active_account=active_account, db=db)
    type_overview_response = []
    for c_type in category_types:
        type_overview_response.append(category_type_service.get_type_month_breakdown(type_name=c_type.name, db=db, year=year, month=month, active_account=active_account))

    return type_overview_response

@category_type_controller.get("/overview/year")
def get_year_overview(active_account_id: Annotated[str, Header()], year: int, db: Session = Depends(get_db)) -> YearOverview:
     # Check if the account exists
    active_account = account_service.get_account(db=db, account_id=int(active_account_id))

    if not active_account:
        raise AccountNotFoundException(active_account_id)

    year_overview_response: YearOverview = category_type_service.get_year_overview(year=year, db=db, active_account=active_account)

    return year_overview_response