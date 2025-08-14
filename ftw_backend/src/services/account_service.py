from sqlalchemy.orm import Session
from models.account import Account, AccountCreate, AccountView, AccountEdit
from database.schemas import AccountSchema
class AccountService:
    def __init__(self):
        pass

    def get_all_accounts(self, db: Session) -> list[Account]:
        schemas: list[AccountSchema] = db.query(AccountSchema).all()

        return [Account.model_validate(schema) for schema in schemas]

    def get_account(self, account_id: int, db: Session) -> Account | None:
        try:
            account = db.query(AccountSchema).filter(AccountSchema.id == account_id).first()
            return Account.model_validate(account)
        except:
            return None

    def create_account(self, new_account: AccountCreate, db: Session) -> Account:
        created_account: AccountSchema = self.convert_account_information(AccountSchema(), new_account)
        db.add(created_account)
        db.commit()
        db.refresh(created_account)

        return created_account
    
    def update_account(self, account_id: int, new_account: AccountEdit, db: Session) -> Account:
        # Get original account
        original_account: AccountSchema = db.query(AccountSchema).filter(account_id == AccountSchema.id).first()

        # Update information
        updated_account: AccountSchema = self.convert_account_information(original_account, new_account)

        # Commit to db
        db.commit()
        db.refresh(updated_account)

        return updated_account

    def delete_account(self, account_id: int, db: Session):
        # Get original account
        original_account: AccountSchema = db.query(AccountSchema).filter(account_id == AccountSchema.id).first()

        # Delete account
        db.delete(original_account)
        db.commit()

        return original_account

    def convert_account_information(self, to_model: Account | AccountSchema, from_model: AccountCreate) -> Account | AccountSchema:
        for field, value in from_model.model_dump(exclude_none=True).items():
            setattr(to_model, field, value)

        return to_model