from sqlalchemy.orm import Session
from models.account import Account, AccountCreate, AccountView, AccountEdit
from database.schemas import AccountSchema
from fastapi import HTTPException, status

class AccountService:
    """
    Service class for managing account operations such as retrieval, creation,
    updating, and deletion of accounts in the database.
    """

    def __init__(self):
        pass

    def get_all_accounts(self, db: Session) -> list[Account]:
        """
        Retrieve all accounts from the database.

        Args:
            db (Session): SQLAlchemy database session.

        Returns:
            list[Account]: List of Account Pydantic models.
        """
        schemas: list[AccountSchema] = db.query(AccountSchema).all()
        return [Account.model_validate(schema) for schema in schemas]

    def create_account(self, new_account: AccountCreate, db: Session) -> Account:
        """
        Create a new account in the database.

        Args:
            new_account (AccountCreate): Data for the new account.
            db (Session): SQLAlchemy database session.

        Returns:
            Account: The created Account Pydantic model.

        Raises:
            HTTPException: If account creation fails.
        """
        try:
            created_account: AccountSchema = self.convert_account_information(AccountSchema(), new_account)
            db.add(created_account)
            db.commit()
            db.refresh(created_account)
            return Account.model_validate(created_account)
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create account: {str(e)}"
            )

    def update_account(self, account_id: int, new_account: AccountEdit, db: Session) -> Account:
        """
        Update an existing account in the database.

        Args:
            account_id (int): ID of the account to update.
            new_account (AccountEdit): Updated account data.
            db (Session): SQLAlchemy database session.

        Returns:
            Account: The updated Account Pydantic model.

        Raises:
            HTTPException: If the account does not exist or update fails.
        """
        original_account: AccountSchema = db.query(AccountSchema).filter(AccountSchema.id == account_id).first()
        if not original_account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Account with id {account_id} not found."
            )
        try:
            updated_account: AccountSchema = self.convert_account_information(original_account, new_account)
            db.commit()
            db.refresh(updated_account)
            return Account.model_validate(updated_account)
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update account: {str(e)}"
            )

    def delete_account(self, account_id: int, db: Session):
        """
        Delete an account from the database.

        Args:
            account_id (int): ID of the account to delete.
            db (Session): SQLAlchemy database session.

        Returns:
            Account: The deleted Account Pydantic model.

        Raises:
            HTTPException: If the account does not exist or deletion fails.
        """
        original_account: AccountSchema = db.query(AccountSchema).filter(AccountSchema.id == account_id).first()
        if not original_account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Account with id {account_id} not found."
            )
        try:
            db.delete(original_account)
            db.commit()
            return Account.model_validate(original_account)
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete account: {str(e)}"
            )

    def convert_account_information(self, to_model: Account | AccountSchema, from_model: AccountCreate | AccountEdit) -> Account | AccountSchema:
        """
        Copy fields from a Pydantic model to a SQLAlchemy model or another Pydantic model.

        Args:
            to_model (Account | AccountSchema): The model to update.
            from_model (AccountCreate | AccountEdit): The model with new data.

        Returns:
            Account | AccountSchema: The updated model.
        """
        for field, value in from_model.model_dump(exclude_none=True).items():
            setattr(to_model, field, value)
        return