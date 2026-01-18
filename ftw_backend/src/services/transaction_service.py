from sqlalchemy.orm import Session, joinedload # type: ignore
from models.transaction import Transaction, TransactionCreate,TransactionTypes, TransactionEdit
from database.schemas import TransactionSchema, CategorySchema
from exceptions.exceptions import CategoryNotFoundException
from utils.logging import setup_loggers

logger = setup_loggers()


class TransactionService:
    # ======================================================================================================== #
    #                                       CREATE FUNCTIONS
    # ======================================================================================================== #
    def add_transactions(self, new_transactions: list[TransactionCreate], db: Session):
        """
        Add a new transaction to the database.

        Args:
            new_transaction (TransactionEdit): The transaction data to add.
            db (Session): The SQLAlchemy database session.

        Returns:
            Transaction: The added transaction as a Pydantic model.
        """
        new_transaction_schemas: list[TransactionSchema] = [self.convert_transaction_data(TransactionSchema(), transaction) for transaction in new_transactions]
        db.add_all(new_transaction_schemas)

        return new_transaction_schemas

    # ======================================================================================================== #
    #                                       GET FUNCTIONS
    # ======================================================================================================== #

    def get_all_transactions(self, db: Session, iban: str = "", as_schema: bool = False, year: int | None = None, month: int | None = None) -> list[Transaction]:
        iban = self.format_iban(iban)
        
        if iban == "":
            transactions = (
            db.query(TransactionSchema)
            .options(joinedload(TransactionSchema.category))
            .all()
            )
        else:
            transactions = (
            db.query(TransactionSchema)
            .filter(TransactionSchema.owner_iban == iban)
            .options(joinedload(TransactionSchema.category))
            .all()
            )

        if year is not None:
            transactions = [transaction for transaction in transactions if transaction.date_executed.year == year]

        if month is not None and month != 0:
            transactions = [transaction for transaction in transactions if transaction.date_executed.month == month]

        if as_schema:
            return transactions
        else:
            return [Transaction.model_validate(transaction) for transaction in transactions]

    def get_transaction(self, transaction_id: int, db: Session, iban: str = "", as_schema: bool = False) -> Transaction:
        """
        Retrieve a transaction as a Pydantic model by its ID.

        Args:
            transaction_id (int): The ID of the transaction.
            db (Session): The SQLAlchemy database session.

        Returns:
            Transaction: The transaction as a Pydantic model.
        """
        if iban == "":
            transaction_schema = (
            db.query(TransactionSchema)
            .filter(TransactionSchema.id == transaction_id)
            .options(joinedload(TransactionSchema.category))
            .first())
        else:
            transaction_schema = (
            db.query(TransactionSchema)
            .filter(TransactionSchema.owner_iban == iban)
            .filter(TransactionSchema.id == transaction_id)
            .options(joinedload(TransactionSchema.category))
            .first()
            )

        if as_schema:
            return transaction_schema
        else:
            return self.transaction_service.schema_to_model(transaction_schema)

    # ======================================================================================================== #
    #                                       UPDATE FUNCTIONS
    # ======================================================================================================== #   
    def edit_transaction(self, transaction_id: int, new_transaction: TransactionEdit, db: Session) -> TransactionSchema:
        """
        Edit an existing transaction.

        Args:
            transaction_id (int): The ID of the transaction to edit.
            new_transaction (TransactionEdit): The new transaction data.
            db (Session): The SQLAlchemy database session.

        Returns:
            Transaction: The updated transaction as a Pydantic model.
        """
        # Check if transaction exists
        transaction_schema: Transaction = self.get_transaction(transaction_id=transaction_id, db=db, as_schema=True)
        
        editted_transaction_schema: Transaction = self.convert_transaction_data(transaction_schema, new_transaction)

        # Update the category if needed
        if new_transaction.category_id != transaction_schema.category_id:
            self.add_category_to_transaction(transaction_schema, new_transaction.category_id, db)

        return editted_transaction_schema    

    def convert_transaction_data(self, old_transaction: Transaction | TransactionSchema, new_transaction: TransactionEdit | TransactionCreate) -> Transaction:
        """
        Update an existing transaction object with new data.

        Args:
            old_transaction (Transaction | TransactionSchema): The existing transaction object.
            new_transaction (TransactionEdit): The new transaction data.

        Returns:
            Transaction: The updated transaction object.
        """
        for field, value in new_transaction.model_dump(exclude_none=True).items():
            # Convert values into right types
            if field == "category_id":
                pass

            else:
                setattr(old_transaction, field, value)
        
        return old_transaction

    # ======================================================================================================== #
    #                                       DELETE FUNCTIONS
    # ======================================================================================================== # 
  
    def delete_transaction(self, transaction_id: int, db: Session) -> Transaction | None:
        """
        Delete a transaction by its ID.

        Args:
            transaction_id (int): The ID of the transaction to delete.
            db (Session): The SQLAlchemy database session.

        Returns:
            Transaction | None: The deleted transaction as a Pydantic model, or None if not found.
        """
        transaction_schema: TransactionSchema = self.get_transaction(transaction_id=transaction_id, db=db, as_schema=True)
        db.delete(transaction_schema)
        
    def delete_multiple_transactions(self, transaction_ids: list[int], db: Session) -> None:
        """
        Delete multiple transactions by their IDs.

        Args:
            transaction_ids (list[int]): The IDs of the transactions to delete.
            db (Session): The SQLAlchemy database session.

        Returns:
            None
        """
        db.query(TransactionSchema).filter(TransactionSchema.id.in_(transaction_ids)).delete(synchronize_session=False)
       
        return None
    
    # ======================================================================================================== #
    #                                      HELPER FUNCTIONS
    # ======================================================================================================== # 
 
    # ======================================================================================================== #
#                                       INFORMATION FUNCTIONS
    # ======================================================================================================== # 
 
    def calculate_total_amount_of_transactions(self, db: Session, iban: str = "") -> dict[str, float]:
        # Get transactions from the db
        transaction: list[Transaction] = self.get_all_transactions(db=db, iban=iban, as_schema=True)

        total_savings: float = 0
        total_income: float = 0
        total_expenses: float = 0
        total_unaccounted: float = 0
        for transaction in transaction:
            match transaction.transaction_type:
                case TransactionTypes.EXPENSES:
                    total_expenses += transaction.value
                case TransactionTypes.SAVINGS:
                    total_savings += transaction.value
                case TransactionTypes.INCOME:
                    total_income += transaction.value
                case TransactionTypes.NONE:
                    total_unaccounted += abs(transaction.value)
        response: dict[str, float] = {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "total_savings": total_savings,
            "total_unaccounted": total_unaccounted
        }

        return response