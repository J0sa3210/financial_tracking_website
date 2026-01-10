from fastapi import UploadFile, Depends
from utils.logging import setup_loggers
from pandas import read_csv, DataFrame
from io import BytesIO
from database import get_db
from sqlalchemy.orm import Session
from .transaction_service import TransactionService
from models.transaction import TransactionCreate, TransactionTypes
from models.counterpart import CounterpartCreate
from models.category import Category
from models.account import Account
from database.schemas import CounterpartSchema, CategorySchema, TransactionSchema
from .category_service import CategoryService
from .account_service import AccountService
from .counterpart_service import CounterpartService
from exceptions.exceptions import AccountNotFoundException

import logging
logger = setup_loggers()
logger.setLevel(logging.DEBUG)

class CSV_handler():
    def __init__(self, file: UploadFile):
        self.file = file
        self.category_service = CategoryService()
        self.counterpart_service = CounterpartService()
        self.transaction_service = TransactionService()
        self.account_service = AccountService()

    def read_file(self):
        try:
            contents = self.file.file.read()
            return contents
        except Exception as e:
            logger.error(f"Error reading file: {e}")
            raise e
    
    def convert_to_df(self):
        # Read the file contents
        content = self.read_file()

        csv_file = BytesIO(content)
        # Load in using pandas
        df: DataFrame = read_csv(csv_file, delimiter=";")
        return df

    def clean_df(self, df: DataFrame) -> DataFrame:
        useful_columns =  [
        "Rekening",
        "Boekingsdatum",
        "Rekening tegenpartij",
        "Naam tegenpartij bevat",
        "Transactie",
        "Bedrag",
        "Mededelingen"
        ]

        df = df[useful_columns].copy()
        
        df["Rekening tegenpartij"] = df["Rekening tegenpartij"].fillna("")
        df["Mededelingen"] = df["Mededelingen"].fillna("")
        df["Naam tegenpartij bevat"] = df["Naam tegenpartij bevat"].fillna("")
        df["Naam tegenpartij bevat"] = df["Naam tegenpartij bevat"].str.lower()
        
        
        return df
    
    def get_transaction_type(self, amount: float, counterpart_account: str) -> TransactionTypes:
        if amount < 0:
            return TransactionTypes.EXPENSES
        elif amount > 0:
            return TransactionTypes.INCOME
        else:
            if counterpart_account:
                return TransactionTypes.SAVINGS
            else:
                return TransactionTypes.NONE
    
    def convert_to_ISO_format(self, date_str: str) -> str:
        """
        Convert a date string to ISO format (YYYY-MM-DD).
        """
        # Convert DD/MM/YYYY to YYYY-MM-DD
        try:
            split_date: str = date_str.split("/")[::-1]
            return "-".join(split_date)  
        except Exception as e:
            logger.error(f"Error converting date to ISO format: {e}")
            raise e

    def convert_df_to_transactions(self, df: DataFrame, counterpart_map: dict[str, CounterpartSchema] = {}) -> list[TransactionCreate]:
        transactions: list[TransactionCreate] = []

        for _, row in df.iterrows():

            transaction_type: TransactionTypes = TransactionTypes.NONE
            counterpart: CounterpartSchema = counterpart_map[row["Naam tegenpartij bevat"]]
            date: str = self.convert_to_ISO_format(row["Boekingsdatum"])

            transaction: TransactionCreate = TransactionCreate(
                transaction_type = transaction_type,

                owner_iban = row["Rekening"],
                counterpart_name = row["Naam tegenpartij bevat"],
                counterpart_id = counterpart.id,
                counterpart_iban = row["Rekening tegenpartij"],
                value = float(row["Bedrag"]/ 100),  # The value is in cents
                date_executed = date,  # Convert to YYYY-MM-DD format
                description = row["Mededelingen"]
            )

            transactions.append(transaction)

        return transactions

    def export_counterparts(self, counterparts: list[str], db: Session, owner_id: int):
        """
        Export all counterparts to the database.
        """
        counterparts_map: dict[str, CounterpartSchema] = {}
        # Add new counterparts to the database
        for cp_name in counterparts:
            if cp_name not in counterparts_map.keys():
                logger.debug(f"Checking counterpart {cp_name} in database.")
                cp: CounterpartSchema = self.counterpart_service.create_counterpart(new_counterpart=CounterpartCreate(name=cp_name, owner_id=owner_id), db=db, owner_id=owner_id)
                counterparts_map[cp.name] = cp

        return counterparts_map

    def process_file(self, db: Session = Depends(get_db)):
        # Convert file to DataFrame
        df: DataFrame = self.convert_to_df()
        df: DataFrame = self.clean_df(df)

        
        # Export all different owner account numbers
        owner_ibans: list[str] = df["Rekening"].unique().tolist()
        logger.debug(f"Owner IBANs found in CSV: {owner_ibans}")

        for owner_iban in owner_ibans:
            logger.debug(f"Processing transactions for account number: {owner_iban}")
            try:
                owner_account : Account = self.account_service.get_account_by_iban(db=db, iban=owner_iban)
                logger.debug(f"Found owner account: {owner_account}")
                
                # Gather all present counterparts. If not present, add them to the database
                counterpart_map: dict[str, CounterpartSchema] = self.export_counterparts(df["Naam tegenpartij bevat"].unique(), db, owner_id=owner_account.id)
                logger.debug(f"Counterpart map: {counterpart_map}")
                # Filter DataFrame for the current owner account

                # Convert DataFrame to transactions
                new_transactions: list[TransactionCreate] = self.convert_df_to_transactions(df, counterpart_map=counterpart_map)
                added_transaction: list[TransactionSchema] = self.transaction_service.add_transactions(new_transactions, db)

                # Add transactions to the right category based on the counterpart
                for transaction in added_transaction:
                    cp: CounterpartSchema = counterpart_map[transaction.counterpart_name]
                    if cp.category_id is not None:
                        logger.debug(f"Assigning category ID {cp.category_id} to transaction ID {transaction.id} based on counterpart {cp.name}")
                        self.category_service.add_transaction_to_category(transaction_id=transaction.id, category_id=cp.category_id, owner_id=owner_account.id, db=db)

                logger.info("CSV file processed and transactions added successfully.")
            
            except AccountNotFoundException as e:
                logger.error(f"Error processing transactions for account number {owner_iban}: {e.msg}")
                continue