from sqlalchemy.orm import Session, joinedload
from models.transaction import Transaction, TransactionCreate, TransactionEdit
from database.schemas import TransactionSchema
from fastapi import HTTPException
from sqlalchemy.exc import NoResultFound
from datetime import date, time
from exceptions.exceptions import FormattingException


class TransactionService:
    def get_all_transactions(self, db: Session) -> list[Transaction]:
        transactions = (
        db.query(TransactionSchema)
        .options(joinedload(TransactionSchema.category))
        .all()
        )

        return [Transaction.model_validate(transaction) for transaction in transactions]

    def get_all_transaction_schemas(self, db: Session) -> list[TransactionSchema]:
        return db.query(TransactionSchema).all()

    def add_transactions(self, new_transactions: list[TransactionCreate], db: Session):
        """
        Add a new transaction to the database.

        Args:
            new_transaction (TransactionEdit): The transaction data to add.
            db (Session): The SQLAlchemy database session.

        Returns:
            Transaction: The added transaction as a Pydantic model.
        """
        for transaction in new_transactions:
            new_transaction_schema: Transaction = self.convert_transaction_data(TransactionSchema(), transaction)
            db.add(new_transaction_schema)

        db.commit()
        db.refresh(new_transaction_schema)
  
    def delete_transaction(self, transaction_id: int, db: Session) -> Transaction | None:
        """
        Delete a transaction by its ID.

        Args:
            transaction_id (int): The ID of the transaction to delete.
            db (Session): The SQLAlchemy database session.

        Returns:
            Transaction | None: The deleted transaction as a Pydantic model, or None if not found.
        """
        transaction_schema: TransactionSchema = self.get_transaction_schema(transaction_id=transaction_id, db=db)
        deleted_transaction = self.schema_to_model(transaction_schema)
        db.delete(transaction_schema)
        db.commit()
        return deleted_transaction

    
    def get_transaction_schema(self, transaction_id: int, db: Session) -> TransactionSchema:
        """
        Retrieve a transaction schema object by its ID.

        Args:
            transaction_id (int): The ID of the transaction.
            db (Session): The SQLAlchemy database session.

        Raises:
            NoResultFound: If the transaction is not found.

        Returns:
            TransactionSchema: The SQLAlchemy transaction schema object.
        """
        transaction_schema = db.query(TransactionSchema).filter(TransactionSchema.id == transaction_id).first()

        if transaction_schema == None:
            raise NoResultFound()
        return transaction_schema
        
    
    def get_transaction(self, transaction_id: int, db: Session) -> Transaction:
        """
        Retrieve a transaction as a Pydantic model by its ID.

        Args:
            transaction_id (int): The ID of the transaction.
            db (Session): The SQLAlchemy database session.

        Returns:
            Transaction: The transaction as a Pydantic model.
        """
        transaction_schema: TransactionSchema = self.get_transaction_schema(transaction_id=transaction_id, db=db)
        
        return self.transaction_service.schema_to_model(transaction_schema)
    
    
    def edit_transaction(self, transaction_id: int, new_transaction: TransactionEdit, db: Session) -> Transaction:
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
        transaction_schema: Transaction = self.get_transaction_schema(transaction_id=transaction_id, db=db)
        editted_transaction_schema: Transaction = self.convert_transaction_data(transaction_schema, new_transaction)

        db.commit()
        db.refresh(editted_transaction_schema)
        return Transaction.model_validate(editted_transaction_schema)    
    
    
    def convert_transaction_data(self, old_transaction: Transaction | TransactionSchema, new_transaction: TransactionEdit) -> Transaction:
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
            

            setattr(old_transaction, field, value)
        
        return old_transaction
    
    
    def schema_to_model(self, schema: TransactionSchema) -> Transaction:
        """
        Convert a SQLAlchemy TransactionSchema object to a Pydantic Transaction model.

        Args:
            schema (TransactionSchema): The SQLAlchemy transaction schema object.

        Returns:
            Transaction: The transaction as a Pydantic model.
        """
        return Transaction.model_validate(schema)
    
    
    def model_to_schema(self, model: Transaction) -> TransactionSchema:
        """
        Convert a Pydantic Transaction model to a SQLAlchemy TransactionSchema object.

        Args:
            model (Transaction): The Pydantic transaction model.

        Returns:
            TransactionSchema: The SQLAlchemy transaction schema object.
        """
        return TransactionSchema(**model.model_dump())

    
    def calculate_total_amount_of_transactions(self, db: Session) -> dict[str, float]:
        # Get transactions from the db
        transaction: list[Transaction] = db.query(TransactionSchema).all()

        total_savings: float = 0
        total_income: float = 0
        total_expenses: float = 0
        for transaction in transaction:
            match transaction.transaction_type:
                case "Expenses":
                    total_expenses += transaction.value
                case "Savings":
                    total_savings += transaction.value
                case "Income":
                    total_income += transaction.value
        response: dict[str, float] = {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "total_savings": total_savings
        }

        # print(f"Total amount of transactions: {response}")
        return response

             
