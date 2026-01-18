from sqlalchemy.orm import Session # type: ignore
from models.account import Account, AccountCreate, AccountEdit
from database.schemas import AccountSchema
from utils.logging import setup_loggers
import logging
from exceptions.exceptions import AccountNotFoundException

logger = setup_loggers()
logger.setLevel(logging.DEBUG)


class AccountService:

    # ======================================================================================================== #
    #                                       SETUP CLASS
    # ======================================================================================================== #

    def __init__(self):
        pass
    
    # ======================================================================================================== #
    #                                       CREATE FUNCTIONS
    # ======================================================================================================== #
    
    def create_account(self, new_account: AccountCreate, db: Session) -> Account:
        created_account: AccountSchema = self.convert_account_information(AccountSchema(), new_account)
        db.add(created_account)
        
        return created_account
    
    # ======================================================================================================== #
    #                                       GET FUNCTIONS
    # ======================================================================================================== #
    
    def get_all_accounts(self, db: Session) -> list[Account]:
        schemas: list[AccountSchema] = db.query(AccountSchema).all()

        return [Account.model_validate(schema) for schema in schemas]

    def get_account(self, account_id: int, db: Session) -> Account | None:
        try:
            account = db.query(AccountSchema).filter(AccountSchema.id == account_id).first()
            return Account.model_validate(account)
        except:
            return None
        
    def get_account_by_iban(self, iban: str, db: Session) -> Account | None:
        iban = self.unformat_IBAN(iban)
        
        try:
            account = db.query(AccountSchema).filter(AccountSchema.iban == iban).first()
            if account is None:
                logger.error(f"Account with IBAN {iban} not found.")
                raise AccountNotFoundException(iban)
            return Account.model_validate(account)
        except Exception as e:
            logger.error(f"Error retrieving account with IBAN {iban}: {e}")
            raise AccountNotFoundException(iban)

    # ======================================================================================================== #
    #                                       UPDATE FUNCTIONS
    # ======================================================================================================== #
    
    def update_account(self, account_id: int, new_account: AccountEdit, db: Session) -> Account:
        # Get original account
        original_account: AccountSchema = db.query(AccountSchema).filter(account_id == AccountSchema.id).first()

        # Update information
        updated_account: AccountSchema = self.convert_account_information(original_account, new_account)

        return updated_account
    
    def convert_account_information(self, to_model: Account | AccountSchema, from_model: AccountCreate) -> Account | AccountSchema:
        for field, value in from_model.model_dump(exclude_none=True).items():
            if field == "iban":
                value = self.unformat_IBAN(value)

            setattr(to_model, field, value)

        return to_model

    # ======================================================================================================== #
    #                                       DELETE FUNCTIONS
    # ======================================================================================================== # 

    def delete_account(self, account_id: int, db: Session):
        # Get original account
        original_account: AccountSchema = db.query(AccountSchema).filter(account_id == AccountSchema.id).first()

        # Delete account
        db.delete(original_account)
        
        return original_account

    def format_IBAN(self, iban: str) -> str:
        # Formats IBAN by adding a space every 4 characters
        iban = iban.replace(" ", "")
        return " ".join(iban[i:i+4] for i in range(0, len(iban), 4))
    
    def unformat_IBAN(self, iban: str) -> str:
        iban = iban.replace(" ","").upper()
        return iban