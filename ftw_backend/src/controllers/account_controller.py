from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Annotated
from database.schemas import AccountSchema
from models.account import AccountView, AccountCreate, AccountEdit
from database import get_db
from services import AccountService
from exceptions.exceptions import AccountNotFoundException
account_controller = APIRouter(
    prefix="/accounts",
)

accountService: AccountService = AccountService()

@account_controller.get("/", )
async def get_all_accounts(db: Session = Depends(get_db)):
    result = accountService.get_all_accounts(db)
    return result

@account_controller.get("/{account_id}/", response_model=AccountView)
async def get_account(account_id: int, db: Session = Depends(get_db)):
    result = accountService.get_account(account_id, db)
    if result == None:
        raise AccountNotFoundException(account_id)
    return result

@account_controller.post("/", response_model=AccountView)
async def create_account(new_account: AccountCreate, db: Session = Depends(get_db)):
    created_account = accountService.create_account(new_account, db)
    return created_account

@account_controller.put("/{account_id}/", response_model=AccountView)
async def update_account(account_id: int, new_account: AccountEdit, db: Session = Depends(get_db)):
    updated_account: AccountSchema = accountService.update_account(account_id, new_account, db)
    return updated_account

@account_controller.delete("/{account_id}", response_model=AccountView)
async def delete_account(account_id: int, db: Session = Depends(get_db)):
    deleted_account: AccountSchema = accountService.delete_account(account_id, db)
    return deleted_account