from models.category import Category, CategoryCreate
from database.schemas import CategorySchema, CounterpartSchema, TransactionSchema
from sqlalchemy.orm import Session, joinedload  # type: ignore
from models.transaction import TransactionCreate, Transaction, TransactionEdit, TransactionTypes
from typing import Optional
from models.counterpart import Counterpart
from .counterpart_service import CounterpartService
from .transaction_service import TransactionService
from .account_service import AccountService
from fastapi import HTTPException  # type: ignore
from logging import Logger
from utils.logging import setup_loggers
from models.account import Account

logger: Logger = setup_loggers()

class CategoryService():
    def __init__(self):
        self.counterpart_service: CounterpartService = CounterpartService()
        self.transaction_service: TransactionService = TransactionService()
        self.account_service : AccountService = AccountService()

    def get_all_categories(self, db: Session, as_schema: bool = False, owner_id: int = None) -> list[Category]:
        if owner_id is not None:
            categories = db.query(CategorySchema).options(joinedload(CategorySchema.transactions),
                joinedload(CategorySchema.counterparts)).filter(CategorySchema.owner_id==owner_id).all()
        else:
            categories = db.query(CategorySchema).options(joinedload(CategorySchema.transactions),
                joinedload(CategorySchema.counterparts)).all()
        

        if as_schema:
            return categories
        else:
            return [Category.model_validate(category) for category in categories]
        
        
    def get_category(self, db: Session, category_id: int, as_schema: bool = False, owner_id: int = None) -> list[Category]:
        if owner_id is not None:
            category = db.query(CategorySchema).options(joinedload(CategorySchema.transactions),
                joinedload(CategorySchema.counterparts)).filter(CategorySchema.owner_id==owner_id).filter(CategorySchema.id==category_id).first()
        else:
            category = db.query(CategorySchema).options(joinedload(CategorySchema.transactions),
                joinedload(CategorySchema.counterparts)).filter(CategorySchema.id==category_id).first()
        

        if as_schema:
            return category
        else:
            return Category.model_validate(category)

    def add_category(self, new_category: CategoryCreate, db: Session, owner_id: int) -> CategorySchema:
        """
        Add a new category to the database.
        """
        category_instance = self.convert_category_data(CategorySchema(), new_category, db)
        category_instance.owner_id = owner_id
        db.add(category_instance)
        db.flush()     

        # Update all transaction categories
        transaction_schemas: list[Transaction] = self.transaction_service.get_all_transactions(db, as_schema=True)
        self.update_transaction_category(transaction_schemas, db, owner_id)
        db.commit()

        return category_instance
    
    def update_category(self, category_id: int, updated_category: CategoryCreate, db: Session) -> CategorySchema:
        existing_category = db.query(CategorySchema).filter(CategorySchema.id == category_id).first()
        if not existing_category:
            raise HTTPException(status_code=404, detail="Category not found")
        updated_category = self.convert_category_data(existing_category, updated_category, db)

        db.commit()
        db.refresh(updated_category)

        # Update all transaction categories
        transactions: list[TransactionSchema] = self.transaction_service.get_all_transactions(db, as_schema=True)
        self.update_transaction_category(transactions, db, existing_category.owner_id)
        db.commit()

        return updated_category

    def convert_category_data(self, category_instance: CategorySchema, new_category: CategoryCreate, db: Session) -> CategorySchema:
        """
        Update an existing category object with new data.
        """
        for field, value in new_category.model_dump(exclude_none=True).items():
            if field == "counterparts":
                # Extract all ids from the given Counterparts and filter out the right CounterpartSchemas based on these ids
                ids = [cp['id'] if isinstance(cp, dict) else cp.id for cp in value]
                category_instance.counterparts = db.query(CounterpartSchema).filter(CounterpartSchema.id.in_(ids)).all()
                logger.info(f"Updated category ({category_instance.name}) counterparts to {len(category_instance.counterparts)}.")
            else:
                setattr(category_instance, field, value)

        return category_instance
    
    def delete_category(self, category_id: int, db: Session, owner_id: int) -> CategorySchema:
        # Get the owner account
        owner_account = self.account_service.get_account(db=db, account_id=owner_id)

        existing_category = self.get_category(db, category_id=category_id, as_schema=True, owner_id=owner_account.id)

        if not existing_category:
            raise HTTPException(status_code=404, detail="Category not found")

        # Option A: set FK to NULL for counterparts and transactions, preserving rows
        db.query(CounterpartSchema).filter(CounterpartSchema.category_id == category_id).update(
            {CounterpartSchema.category_id: None}, synchronize_session="fetch"
        )
        db.query(TransactionSchema).filter(TransactionSchema.category_id == category_id).update(
            {TransactionSchema.category_id: None, TransactionSchema.category_name: None, TransactionSchema.transaction_type: None}, synchronize_session="fetch"
        )
        

        # Update all transaction categories
        db.delete(existing_category)
        db.commit()

        transactions: list[TransactionSchema] = self.transaction_service.get_all_transactions(db, as_schema=True, iban=owner_account.iban)
        self.update_transaction_category(transactions, db, owner_id=owner_id)
        db.commit()

        return existing_category
    
    def update_transaction_category(self, transactions: list[TransactionSchema], db: Session, owner_id: int):
        # Create mapping between category and id
        categories: list[Category] = self.get_all_categories(db, as_schema=True, owner_id=owner_id)
        category_map: dict[int, Category] = {category.id: category for category in categories}

        # Create a mapping between counterpart name and category id
        counterparts: list[Counterpart] = self.counterpart_service.get_all_counterparts(db)
        counterpart_map: dict[str, int] = {counterpart.name: counterpart.category_id for counterpart in counterparts if counterpart.category_id != None}

        transaction_schema: TransactionSchema
        for transaction_schema in transactions:
            try:
                category = category_map[counterpart_map[transaction_schema.counterpart_name]]
                transaction_schema.category = category
                transaction_schema.category_name = category.name
                transaction_schema.transaction_type = category.category_type
                logger.info(f"Added transaction {transaction_schema.description} at {transaction_schema.date_executed} to category {category}.")
            except KeyError:
                transaction_schema.category = None
                transaction_schema.category_id = None
                transaction_schema.category_name = None
                transaction_schema.transaction_type = TransactionTypes.NONE

    def filter_transactions_by_date(self, transactions: list[TransactionSchema], year: int, month: Optional[int] = None) -> list[Transaction]:
        if month is not None:
            filtered_transactions = [transaction for transaction in transactions if transaction.date_executed.year == year and transaction.date_executed.month == month]
        else:
            filtered_transactions = [transaction for transaction in transactions if transaction.date_executed.year == year]
        return filtered_transactions

    def add_counterpart_to_category(self, db: Session, counterpart: CounterpartSchema, category: CategorySchema):
        # Add counterpart to category
        counterpart.category_id = category.id
        category.counterparts.append(counterpart)
        db.commit()

        # Update all transactions with the counterpart
        db.query(TransactionSchema).filter(TransactionSchema.counterpart_id == counterpart.id).update(
            {TransactionSchema.category_id: category.id,
             TransactionSchema.category_name: category.name,
             TransactionSchema.transaction_type: category.category_type}, synchronize_session="fetch"
        )
        db.commit()

        return category

    def calculate_totals(self, categories: list[Category], db: Session, active_account: Account) -> dict[str, dict[str, float]]:
        pass
        
        # totals: dict[str, dict[str, float]] = {}

        # total_amounts = self.transaction_service.calculate_total_amount_of_transactions(db=db, iban=active_account.iban)
        # for t_type in TransactionTypes:
        #     # Get total of all transactions



        # for category in categories:
        #     total = sum(transaction.value for transaction in category.transactions)
        #     total_expenses[category.name] = total
        # return total_expenses



    ### ADDING/REMOVING TRANSACTION TO/FROM CATEGORY ###

    def add_transaction_to_category(self, db: Session, transaction_id: int, category_id: int, owner_id: int) -> TransactionSchema:
        # Get the category
        category = self.get_category(db=db, category_id=category_id, as_schema=True, owner_id=owner_id)
        if category is None:
            raise HTTPException(status_code=404, detail="Category not found")

        # Get the transaction
        transaction = self.transaction_service.get_transaction(db=db, transaction_id=transaction_id, as_schema=True)
        if transaction is None:
            raise HTTPException(status_code=404, detail="Transaction not found")

        # Update transaction with category info
        transaction.category_id = category.id
        transaction.category_name = category.name
        transaction.transaction_type = category.category_type

        db.commit()
        db.refresh(transaction)

        return transaction

    def remove_transaction_from_category(self, db: Session, transaction_id: int, owner_id: int) -> TransactionSchema:
        # Get the transaction
        transaction = self.transaction_service.get_transaction(db=db, transaction_id=transaction_id, as_schema=True)
        if transaction is None:
            raise HTTPException(status_code=404, detail="Transaction not found")

        # Update transaction with category info
        transaction.category_id = None
        transaction.category_name = None
        transaction.transaction_type = TransactionTypes.NONE

        db.commit()
        db.refresh(transaction)

        return transaction
