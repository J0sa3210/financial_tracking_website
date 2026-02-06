from sqlalchemy.orm import Session, joinedload # type: ignore
from models.transaction import Transaction, TransactionCreate,TransactionTypes, TransactionEdit
from database.schemas import TransactionSchema, AccountSchema, CategorySchema
from .account_service import AccountService
from .category_service import CategoryService
from utils.logging import setup_loggers

logger = setup_loggers()


class TransactionService:
    def __init__(self):
        self.account_service: AccountService = AccountService()
        self.category_service: CategoryService = CategoryService()
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
        new_transaction_schemas: list[TransactionSchema] = [self.convert_transaction_data(TransactionSchema(), transaction, db=db) for transaction in new_transactions]
        db.add_all(new_transaction_schemas)

        return new_transaction_schemas

    # ======================================================================================================== #
    #                                       GET FUNCTIONS
    # ======================================================================================================== #

    def get_all_transactions(self, db: Session, iban: str = "", as_schema: bool = False, year: int | None = None, month: int | None = None) -> list[Transaction]:
        iban = self.account_service.format_IBAN(iban)
        
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
        iban = self.account_service.format_IBAN(iban)
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

        if transaction_schema is None:
            return None

        if as_schema:
            return transaction_schema
        else:
            return Transaction.model_validate(transaction_schema)

    # ======================================================================================================== #
    #                                       UPDATE FUNCTIONS
    # ======================================================================================================== #
    def update_transaction(self,current_transaction: TransactionSchema, updated_transaction: TransactionSchema, db: Session) -> TransactionSchema:
        updated_transaction: TransactionSchema = self.convert_transaction_data(current_transaction=current_transaction, updated_transaction=updated_transaction, db=db)

        return updated_transaction

    def convert_transaction_data(self, current_transaction: Transaction | TransactionSchema, updated_transaction: TransactionEdit | TransactionCreate, db: Session) -> Transaction:
        """
        Update an existing transaction object with new data.

        Args:
            current_transaction (Transaction | TransactionSchema): The existing transaction object.
            updated_transaction (TransactionEdit): The new transaction data.

        Returns:
            Transaction: The updated transaction object.
        """
        # Check if category has changed
        category_changed: bool = updated_transaction.category_id != current_transaction.category_id
        logger.debug("Current category: " + str(current_transaction.category_id))
        logger.debug("Updated category: " + str(updated_transaction.category_id))
        logger.debug("Category has changed: " + str(category_changed))

        for field, value in updated_transaction.__dict__.items():
            # Convert values into right types
            setattr(current_transaction, field, value)

        if category_changed:
            if updated_transaction.category_id is not None:
                category: CategorySchema = self.category_service.get_category(db=db, category_id=updated_transaction.category_id, as_schema=True)
                current_transaction.category_id = category.id
                current_transaction.category_name = category.name
                current_transaction.transaction_type = category.category_type
                logger.info(f"Transaction {current_transaction}")
            else:
                current_transaction.category_id = None
                current_transaction.category_name = None
                current_transaction.transaction_type = TransactionTypes.NONE
        
        return current_transaction

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
 
    def calculate_total_amount_of_transactions(self, db: Session, account: AccountSchema) -> dict[str, float]:
        # Get transactions from the db
        iban: str = self.account_service.unformat_IBAN(account.iban)
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