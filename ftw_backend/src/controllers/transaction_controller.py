from fastapi import APIRouter, Depends, UploadFile, File, Header
from sqlalchemy.orm import Session
from typing import Annotated
from database.schemas import TransactionSchema
from models.transaction import Transaction, TransactionView, TransactionCreate, TransactionEdit
from models.account import is_IBAN
from database import get_db
from services import TransactionService, CSV_handler, AccountService
from exceptions.exceptions import FileTypeExpection
from fastapi import HTTPException  # type: ignore
from utils.logging import setup_loggers
from logging import Logger

# ======================================================================================================== #
#                                       SETUP FUNCTIONS
# ======================================================================================================== #

logger: Logger = setup_loggers()

transaction_controller = APIRouter(
    prefix="/transaction",
)

transaction_service: TransactionService = TransactionService()
account_service: AccountService = AccountService()

# ======================================================================================================== #
#                                       CREATE FUNCTIONS
# ======================================================================================================== #

@transaction_controller.put("", response_model=TransactionView)
async def add_transactions(transactions: list[TransactionCreate], db : Session = Depends(get_db)):
    added_transaction: Transaction = transaction_service.add_transactions(transactions, db=db)
    
    db.commit()
    return added_transaction

@transaction_controller.post("/upload_csv")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise FileTypeExpection(file_type=file.filename.split('.')[-1])
    
    file_handler: CSV_handler = CSV_handler(file=file)
    file_handler.process_file(db=db)

    db.commit()
    
# ======================================================================================================== #
#                                       GET FUNCTIONS
# ======================================================================================================== #


@transaction_controller.get("", response_model=list[TransactionView])
async def get_all_transactions(active_account_id: Annotated[str, Header()], db : Session = Depends(get_db), year: int | None = None, month: int | None = None):
    """
    Get all transactions either as list of TransactionView. These can be filtered based on a date.

    Args:
        active_account_id (Annotated[str, Header): The account id that requests the transactions
        db (Session, optional): The database containing all transactions. Defaults to Depends(get_db).
        year (int | None, optional): The year of the requested transactions. Defaults to None.
        month (int | None, optional): The month of the requested transactoins. Defaults to None.

    Returns:
        list[TransactionView]: A list of the requested transactions
    """
    
    active_account = account_service.get_account(db=db, account_id=int(active_account_id))    
    account_iban: str = active_account.iban

    logger.info(f"Getting transactions for IBAN: {account_iban}, year: {year}, month: {month}" )

    if not is_IBAN(account_iban):
        logger.error(f"IBAN is wrong!")
    account_iban: str = account_service.format_IBAN(account_iban)
    
    results = transaction_service.get_all_transactions(db, iban=account_iban, year=year, month=month)
    return results

# Needs to be in front of "get /{transaction_id}", otherwise it will parse "total" as an int!!
@transaction_controller.get("/total", response_model=dict[str, float])
async def calculate_total_amount(active_account_id: Annotated[str, Header()], db: Session = Depends(get_db)):
    active_account = account_service.get_account(db=db, account_id=int(active_account_id))    
    
    total_amount: dict[str, float] = transaction_service.calculate_total_amount_of_transactions(db=db, account=active_account)
    return total_amount

@transaction_controller.get("/{transaction_id}", response_model=TransactionView)
async def get_transaction(active_account_id: Annotated[str, Header()], transaction_id: int, db: Session = Depends(get_db)):
    active_account = account_service.get_account(db=db, account_id=int(active_account_id))    
    account_iban: str = active_account.iban
    
    selected_transaction: Transaction = transaction_service.get_transaction(transaction_id=transaction_id, db=db, iban=account_iban)
    if selected_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return selected_transaction

# ======================================================================================================== #
#                                       UPDATE FUNCTIONS
# ======================================================================================================== #

@transaction_controller.post("/{transaction_id}", response_model=TransactionView)
async def edit_transaction(transaction_id: int, updated_transaction: TransactionEdit, db: Session = Depends(get_db)):
    current_transaction: TransactionSchema = transaction_service.get_transaction(transaction_id=transaction_id, as_schema=True, db=db)

    if current_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")

    updated_transaction: Transaction = transaction_service.update_transaction(current_transaction=current_transaction, updated_transaction=updated_transaction, db=db)
    db.commit()
    return updated_transaction

# ======================================================================================================== #
#                                       DELETE FUNCTIONS
# ======================================================================================================== #


@transaction_controller.delete("")
async def delete_multiple_transactions(transaction_ids: list[int], db: Session = Depends(get_db)):
    transaction_service.delete_multiple_transactions(transaction_ids=transaction_ids, db=db)
    db.commit()

@transaction_controller.delete("/{transaction_id}")
async def delete_transaction( transaction_id: int, db: Session = Depends(get_db)):
    transaction_service.delete_transaction(transaction_id=transaction_id, db=db)
    db.commit()
