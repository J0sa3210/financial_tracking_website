from fastapi import APIRouter, Depends, Header  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from typing import Annotated, Any
from database.schemas import CategorySchema
from models.category import CategoryView, CategoryCreate, CategoryEdit
from database import get_db
from services import CategoryService, AccountService, CounterpartService
from utils.logging import setup_loggers
from logging import Logger, DEBUG
from fastapi import HTTPException  # type: ignore
from datetime import datetime
from pydantic import BaseModel
from models.account import Account
from models.transaction import TransactionTypes
from exceptions.exceptions import AccountNotFoundException
from services.type_service import TypeService
from models.type_overview import YearOverview, MonthOverview

logger: Logger = setup_loggers()
# logger.setLevel(DEBUG)

type_controller = APIRouter(
    prefix="/type",
)

category_service: CategoryService = CategoryService()
account_service: AccountService = AccountService()
counterpart_service: CounterpartService = CounterpartService()
type_service: TypeService = TypeService()

@type_controller.get("/overview/month/all")
def get_type_overview(active_account_id: Annotated[str, Header()], db: Session = Depends(get_db), year: int | None = None, month: int | None = None) -> list[MonthOverview]:
    # Check if the account exists
    active_account = account_service.get_account(db=db, account_id=int(active_account_id))

    if not active_account:
        raise AccountNotFoundException(active_account_id)

    type_overview_response = []
    for t_type in TransactionTypes:
        if t_type == TransactionTypes.NONE:
            continue
        type_overview_response.append(type_service.get_type_month_breakdown(type_name=t_type, db=db, year=year, month=month))

    return type_overview_response

@type_controller.get("/overview/year")
def get_year_overview(active_account_id: Annotated[str, Header()], year: int, db: Session = Depends(get_db)) -> YearOverview:
     # Check if the account exists
    active_account = account_service.get_account(db=db, account_id=int(active_account_id))

    if not active_account:
        raise AccountNotFoundException(active_account_id)

    year_overview_response: YearOverview = type_service.get_year_overview(year=year, db=db)

    return year_overview_response