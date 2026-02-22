from models.category import Category, CategoryCreate, CategoryEdit
from database.schemas import CategorySchema, CounterpartSchema, TransactionSchema
from sqlalchemy.orm import Session, joinedload  # type: ignore
from sqlalchemy import func, or_
from models.transaction import TransactionCreate, Transaction, TransactionEdit, TransactionTypes
from typing import Optional
from models.counterpart import Counterpart
from .counterpart_service import CounterpartService
from .account_service import AccountService
from fastapi import HTTPException  # type: ignore
from logging import Logger
from utils.logging import setup_loggers
from models.account import Account

logger: Logger = setup_loggers()

class CategoryService():
    """
    Category aggregate root.

    Responsibilities:
    - Manage category lifecycle (create, update, delete)
    - Manage category–counterpart relationships
    - Ensure transactions reflect counterpart category assignment

    Invariants:
    - A transaction's category is derived from its counterpart
    - Removing a counterpart from a category clears transaction category data
    """
    # ======================================================================================================== #
    #                                       SETUP CLASS
    # ======================================================================================================== #
 
    def __init__(self):
        self.counterpart_service: CounterpartService = CounterpartService()
        self.account_service : AccountService = AccountService()

    # ======================================================================================================== #
    #                                       CREATE FUNCTIONS
    # ======================================================================================================== #
 
    def add_category(self, new_category: CategoryCreate, db: Session, owner: Account) -> CategorySchema:
        """
        Add a new category to the database.
        """
        current_category = self.convert_category_data(CategorySchema(), new_category, owner, db)
        current_category.owner_id = owner.id
        db.add(current_category)

        return current_category
    
    # ======================================================================================================== #
    #                                       GET FUNCTIONS
    # ======================================================================================================== #

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
        
    def get_all_categories_of_type(self, type_name: TransactionTypes, db: Session, owner_id: int = None) -> list[Category]:
        if owner_id is not None:
            categories: list[CategorySchema] = db.query(CategorySchema).filter(CategorySchema.category_type == type_name, CategorySchema.owner_id==owner_id).all()
        
        return categories
        
    def get_category(self, db: Session, category_id: int, owner_id: int, as_schema: bool = False) -> list[Category]:
        category = db.query(CategorySchema).options(joinedload(CategorySchema.transactions),
                joinedload(CategorySchema.counterparts)).filter(CategorySchema.owner_id==owner_id).filter(CategorySchema.id==category_id).first()
        

        if as_schema:
            return category
        else:
            return Category.model_validate(category)

    # ======================================================================================================== #
    #                                       UPDATE FUNCTIONS
    # ======================================================================================================== # 

    def update_category(self, current_category: CategorySchema, updated_category: CategoryEdit, owner: Account, db: Session) -> CategorySchema:
        # Update category values    
        updated_category: CategorySchema = self.convert_category_data(current_category, updated_category, owner, db)

        # Update all transactions for that category
        tx: TransactionSchema 
        # logger.debug(f"Transaction for category {updated_category.id}: {updated_category.transactions}")
        for tx in updated_category.transactions:
            # logger.debug(f"Updating transaction: {tx.id}")
            tx.category_name = updated_category.name
            tx.transaction_type = updated_category.category_type

        return updated_category

    def convert_category_data(self, current_category: CategorySchema | Category, new_category: CategoryCreate | CategoryEdit, owner: Account, db: Session) -> CategorySchema:
        """
        Update an existing category object with new data.
        """
        data = new_category.model_dump(exclude_none=True)

        # Update scalar fields
        for field, value in data.items():
            if field != "counterparts":
                setattr(current_category, field, value)

        # Update counterpart relationships
        if "counterparts" in data:
            # Resolve incoming counterpart payloads into persistent CounterpartSchema objects
            resolved_counterparts: list[CounterpartSchema] = []
            for cp_payload in new_category.counterparts or []:
                cp_id = getattr(cp_payload, "id", None)
                cp_name = getattr(cp_payload, "name", None)

                cp_obj = None
                if cp_id is not None:
                    cp_obj = self.counterpart_service.get_counterpart_by_id(db=db, id=cp_id, owner_id=owner.id)
                if cp_obj is None and cp_name:
                    # try to find by name for this owner
                    cp_obj = self.counterpart_service.get_counterpart_by_name(db=db, name=cp_name, owner_id=owner.id)
                if cp_obj is None and cp_name:
                    # create a new counterpart for this owner
                    # Counterpart model expected by counterpart_service.create_counterpart may vary;
                    # here we use Counterpart Pydantic/model object (imported as Counterpart)
                    cp_obj = self.counterpart_service.create_counterpart(new_counterpart=Counterpart(name=cp_name), db=db, owner_id=owner.id)

                if cp_obj is not None:
                    resolved_counterparts.append(cp_obj)

            current_ids = {cp.id for cp in current_category.counterparts}
            new_ids = {cp.id for cp in resolved_counterparts}

            # Attach new counterparts
            for cp in resolved_counterparts:
                if cp.id not in current_ids:
                    self._attach_counterpart(current_category, cp)
                    db.flush()
                    self._sync_transactions_for_counterpart(db=db, counterpart=cp, category=current_category, owner_account=owner)

            # Detach removed counterparts
            for cp in list(current_category.counterparts):
                if cp.id not in new_ids:
                    self._detach_counterpart(current_category, cp)
                    db.flush()
                    self._sync_transactions_for_counterpart(db=db, counterpart=cp, category=None, owner_account=owner)

        return current_category
    
    def add_counterpart_to_category(self, category: CategorySchema, counterpart: CounterpartSchema, db: Session, owner_account: Account):
        self._attach_counterpart(category=category, counterpart=counterpart)
        self._sync_transactions_for_counterpart(db=db,counterpart=counterpart, category=category, owner_account=owner_account)
    
    def add_transactions_to_category(self, category: CategorySchema, transaction_ids: list[int], db: Session):
        """
        Assign the given category to transactions with the provided ids and update related fields.
        Returns the number of rows updated.
        """
        if not transaction_ids:
            return 0

        ids = set(transaction_ids)

        values = {
            TransactionSchema.category_id: category.id,
            TransactionSchema.category_name: category.name,
            TransactionSchema.transaction_type: category.category_type,
        }

        query = db.query(TransactionSchema).filter(TransactionSchema.id.in_(ids))
        updated = query.update(values, synchronize_session="fetch")

        # Ensure ORM session objects reflect the relationship
        try:
            tx_rows = db.query(TransactionSchema).filter(TransactionSchema.id.in_(ids)).all()
            for tx in tx_rows:
                tx.category = category
                tx.category_name = category.name
                tx.transaction_type = category.category_type
            db.flush()
        except Exception:
            logger.debug("flush or post-update sync in add_transaction_to_category failed or not required")

        return updated

    # ======================================================================================================== #
    #                                       DELETE FUNCTIONS
    # ======================================================================================================== # 

    def delete_category(self, category_id: int, db: Session, owner_id: int) -> CategorySchema:
        owner_account = self.account_service.get_account(db=db, account_id=owner_id)

        category: CategorySchema = self.get_category(
            db=db,
            category_id=category_id,
            as_schema=True,
            owner_id=owner_account.id,
        )

        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        # 1. Detach counterparts and fix their transactions (ORM-safe)
        for cp in list(category.counterparts):
            # Update transactions *through ORM*
            for tx in cp.transactions:
                tx.category_id = None
                tx.category_name = None
                tx.transaction_type = TransactionTypes.NONE

            cp.category = None

        # 2. Detach transactions directly linked to category (safety net)
        for tx in category.transactions:
            tx.category_id = None
            tx.category_name = None
            tx.transaction_type = TransactionTypes.NONE

        # 3. Delete category
        db.delete(category)

        return category

    # ======================================================================================================== #
    #                               TRANSACTION RELATIONSHIP FUNCTIONS
    # ======================================================================================================== # 

    def sync_transaction(self, transaction: TransactionSchema, db: Session):
        logger.debug(f"Syncing transactions: {transaction}")
        
        if transaction.counterpart is not None:
            category_id: int = transaction.counterpart.category_id
            if category_id is not None:
                category: CategorySchema = self.get_category(db=db, category_id=category_id, as_schema=True)
                transaction.category_id = category.id
                transaction.category_name = category.name
                transaction.transaction_type = category.category_type
            else:
                transaction.category_id = None
                transaction.category_name = None
                transaction.transaction_type = TransactionTypes.NONE

    def _sync_transactions_for_counterpart(
        self,
        db: Session,
        counterpart: CounterpartSchema,
        category: CategorySchema | None,
        owner_account: Account
    ):
        owner_iban: str = self.account_service.format_IBAN(owner_account.iban)

        # When there is a Category add the category_id to all transactions with that counterpart
        if category:
            logger.debug(f"Adding txs to {category.name} with cp {counterpart.name}")
            values = {
                TransactionSchema.category_id: category.id,
                TransactionSchema.category_name: category.name,
                TransactionSchema.transaction_type: category.category_type,
            }
        # When there is no Category remove the current category_id for all transactions with that counterpart.
        else:
            logger.debug(f"Removing txs from category with cp {counterpart.name}")
            values = {
                TransactionSchema.category_id: None,
                TransactionSchema.category_name: None,
                TransactionSchema.transaction_type: TransactionTypes.NONE,
            }

        # Match by counterpart_id OR (fallback) by normalized counterpart_name for existing rows that weren't linked by id.
        query = db.query(TransactionSchema).filter(
            TransactionSchema.owner_iban==owner_iban,
            or_(TransactionSchema.counterpart_id == counterpart.id, TransactionSchema.counterpart_name == counterpart.name)
        )

        updated = query.update(values, synchronize_session="fetch")
        logger.debug(f"_sync_transactions_for_counterpart: updated {updated} rows for counterpart id {counterpart.id} / name '{counterpart.name}'")

        # Ensure session sees changes
        try:
            db.flush()
        except Exception:
            logger.debug("flush after _sync_transactions_for_counterpart update failed or not required")

    def filter_transactions_by_date(self, transactions: list[TransactionSchema], year: int, month: Optional[int] = None) -> list[Transaction]:
        if month is not None:
            filtered_transactions = [transaction for transaction in transactions if transaction.date_executed.year == year and transaction.date_executed.month == month]
        else:
            filtered_transactions = [transaction for transaction in transactions if transaction.date_executed.year == year]
        return filtered_transactions

    # ======================================================================================================== #
    #                               COUNTERPART RELATIONSHIP HELPER FUNCTIONS
    # ======================================================================================================== # 

    def _attach_counterpart(self, category: CategorySchema, counterpart: CounterpartSchema):
        counterpart.category = category
        counterpart.category_id = category.id

    def _detach_counterpart(self, category: CategorySchema, counterpart: CounterpartSchema):
        counterpart.category = None
        counterpart.category_id = None