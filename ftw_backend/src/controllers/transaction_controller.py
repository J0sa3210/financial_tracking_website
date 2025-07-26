from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import Annotated
from database.schemas import TransactionSchema
from models.transaction import Transaction, TransactionEdit
from database import get_db
from services.transaction_service import TransactionService
from exceptions.exceptions import FileTypeExpection
from utils.logging import setup_loggers
from logging import Logger
logger: Logger = setup_loggers()

transaction_controller = APIRouter(
    prefix="/transaction",
)

transaction_service: TransactionService = TransactionService()

@transaction_controller.get("/", )
async def get_all_transactions(db : Session = Depends(get_db)):
    results = db.query(TransactionSchema).all()
    return results

@transaction_controller.put("/", response_model=Transaction)
async def add_transaction(transaction: TransactionEdit, db : Session = Depends(get_db)):
    added_transaction: Transaction = transaction_service.add_transaction(new_transaction=transaction, db=db)
    return added_transaction

@transaction_controller.get("/total/", response_model=dict[str, float])
async def calculate_total_amount(db: Session = Depends(get_db)):
    total_amount: dict[str, float] = transaction_service.calculate_total_amount_of_transactions(db=db)
    return total_amount

@transaction_controller.delete("/{transaction_id}", response_model=Transaction)
async def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    removed_transaction: Transaction = transaction_service.delete_transaction(transaction_id=transaction_id, db=db)
    return removed_transaction

@transaction_controller.get("/{transaction_id}", response_model=Transaction)
async def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    selected_transaction: Transaction = transaction_service.get_transaction(transaction_id=transaction_id, db=db)
    return selected_transaction

@transaction_controller.post("/{transaction_id}", response_model=Transaction)
async def edit_transaction(transaction_id: int, new_transaction: TransactionEdit, db: Session = Depends(get_db)):
    changed_transaction: Transaction = transaction_service.edit_transaction(transaction_id, new_transaction, db)
    return changed_transaction

@transaction_controller.post("/upload_csv/")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise FileTypeExpection(file_type=file.filename.split('.')[-1])
    
    try:
        contents = await file.read()
        # Process the file contents as needed
        logger.info(f"filename: {file.filename}")
        logger.info(f"file contents: {contents[:100]}...")  # Log first 100 bytes for brevity
    except Exception as e:
        logger.error(f"Error reading file: {e}")
    
