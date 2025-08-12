from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Annotated
from database.schemas import AccountSchema
from models.account import AccountView, AccountCreate
from database import get_db
from services import AccountService

account_controller = APIRouter(
    prefix="/accounts",
)

accountService: AccountService = AccountService()

@account_controller.get("/", )
async def get_all_categories(db: Session = Depends(get_db)):
    result = "This is my account"
    return result