from models.category import Category, CategoryCreate
from database.schemas import CategorySchema, CounterpartSchema, TransactionSchema
from sqlalchemy.orm import Session
from models.transaction import TransactionEdit, Transaction
from models.counterpart import Counterpart
from .counterpart_service import CounterpartService
from .transaction_service import TransactionService
from fastapi import HTTPException
from logging import Logger
from utils.logging import setup_loggers

logger: Logger = setup_loggers()

class CategoryService():
    def __init__(self):
        self.counterpart_service: CounterpartService = CounterpartService()
        self.transaction_service: TransactionService = TransactionService()

    def get_all_categories(self, db: Session) -> list[Category]:
        categories = db.query(CategorySchema).all()

        response = []

        for category in categories:
            # Convert each category schema to a Pydantic model
            category = Category(id=category.id,
                                name=category.name,
                                description=category.description, 
                                counterparts=[counterpart.name for counterpart in category.counterparts])
            
            response.append(category)

        return response
        
    def add_category(self, new_category: CategoryCreate, db: Session) -> CategorySchema:
        """
        Add a new category to the database.
        """
        category_instance = self.convert_category_data(CategorySchema(), new_category, db)
        db.add(category_instance)

        
        db.commit()
        db.refresh(category_instance)
        
        # Update all transaction categories
        transactions: list[Transaction] = self.transaction_service.get_all_transactions(db)
        self.update_transaction_category(transactions, db)
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
        transactions: list[Transaction] = self.transaction_service.get_all_transactions(db)
        self.update_transaction_category(transactions, db)
        db.commit()

        return updated_category

    @staticmethod
    def convert_category_data(category_instance: CategorySchema, new_category: CategoryCreate, db: Session) -> CategorySchema:
        """
        Update an existing category object with new data.
        """
        for field, value in new_category.model_dump(exclude_none=True).items():
            if field == "counterparts":
                category_instance.counterparts = db.query(CounterpartSchema).filter(CounterpartSchema.name.in_(value)).all()
            else:
                setattr(category_instance, field, value)

        return category_instance
    
    def delete_category(self, category_id: int, db: Session) -> CategorySchema:
        existing_category = db.query(CategorySchema).filter(CategorySchema.id == category_id).first()

        if not existing_category:
            raise HTTPException(status_code=404, detail="Category not found")

        # Update all transaction categories
        db.delete(existing_category)
        db.commit()

        transactions: list[Transaction] = self.transaction_service.get_all_transactions(db)
        self.update_transaction_category(transactions, db)
        db.commit()

        return existing_category
    
    def update_transaction_category(self, transactions: list[TransactionEdit] | list[Transaction], db: Session) -> str:
        # Create mapping between category and id
        categories: list[Category] = self.get_all_categories(db)
        category_map: dict[int, Category] = {category.id: category.name for category in categories}

        # Create a mapping between counterpart name and category id
        counterparts: list[Counterpart] = self.counterpart_service.get_all_counterparts(db)
        counterpart_map: dict[str, int] = {counterpart.name: counterpart.category_id for counterpart in counterparts if counterpart.category_id != None}

        transaction: TransactionEdit | Transaction
        for transaction in transactions:
            transaction_schema = db.query(TransactionSchema).filter(TransactionSchema.id == transaction.id).first()
            try:
                category = category_map[counterpart_map[transaction.transaction_counterpart_name]]
                transaction_schema.transaction_category = category
                logger.info(f"Added transaction {transaction_schema.description} at {transaction_schema.date_executed} to category {category}.")
            except KeyError:
                transaction_schema.transaction_category = ""
                
        return transactions
    
    def init_transaction_category(self, transactions: list[TransactionEdit], db: Session) -> str:
        # Create mapping between category and id
        categories: list[Category] = self.get_all_categories(db)
        category_map: dict[int, Category] = {category.id: category.name for category in categories}

        # Create a mapping between counterpart name and category id
        counterparts: list[Counterpart] = self.counterpart_service.get_all_counterparts(db)
        counterpart_map: dict[str, int] = {counterpart.name: counterpart.category_id for counterpart in counterparts if counterpart.category_id != None}

        transaction: TransactionEdit
        for transaction in transactions:
            try:
                category = category_map[counterpart_map[transaction.transaction_counterpart_name]]
                transaction.transaction_category = category
                logger.info(f"Added transaction {transaction.description} at {transaction.date_executed} to category {category}.")
            except KeyError:
                pass
                
        return transactions
    