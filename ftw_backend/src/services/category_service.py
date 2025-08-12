from models.category import Category, CategoryCreate
from database.schemas import CategorySchema, CounterpartSchema, TransactionSchema
from sqlalchemy.orm import Session, joinedload
from models.transaction import TransactionCreate, Transaction, TransactionEdit
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
        categories = db.query(CategorySchema).options(joinedload(CategorySchema.transactions)).all()

        return [Category.model_validate(category) for category in categories]
        
    def get_all_category_schemas(self, db: Session) -> list[CategorySchema]:
        return db.query(CategorySchema).all()

    def add_category(self, new_category: CategoryCreate, db: Session) -> CategorySchema:
        """
        Add a new category to the database.
        """
        category_instance = self.convert_category_data(CategorySchema(), new_category, db)
        db.add(category_instance)
        
        db.commit()
        db.refresh(category_instance)
        
        # Update all transaction categories
        transaction_schemas: list[Transaction] = self.transaction_service.get_all_transaction_schemas(db)
        self.update_transaction_category(transaction_schemas, db)
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
        transactions: list[TransactionSchema] = self.transaction_service.get_all_transaction_schemas(db)
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
                # Extract all ids from the given Counterparts and filter out the right CounterpartSchemas based on these ids
                ids = [cp['id'] if isinstance(cp, dict) else cp.id for cp in value]
                category_instance.counterparts = db.query(CounterpartSchema).filter(CounterpartSchema.id.in_(ids)).all()
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

        transactions: list[TransactionSchema] = self.transaction_service.get_all_transaction_schemas(db)
        self.update_transaction_category(transactions, db)
        db.commit()

        return existing_category
    
    def update_transaction_category(self, transactions: list[TransactionSchema], db: Session):
        # Create mapping between category and id
        categories: list[Category] = self.get_all_category_schemas(db)
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
                logger.info(f"Added transaction {transaction_schema.description} at {transaction_schema.date_executed} to category {category}.")
            except KeyError:
                transaction_schema.category = None
                transaction_schema.category_id = None
                transaction_schema.category_name = None
