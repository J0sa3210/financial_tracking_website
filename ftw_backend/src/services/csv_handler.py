from fastapi import UploadFile, Depends
from utils.logging import setup_loggers
from pandas import read_csv, DataFrame
from io import BytesIO
from database import get_db
from sqlalchemy.orm import Session
from .transaction_service import TransactionService
from models.transaction import TransactionCreate, TransactionTypes
from models.counterpart import Counterpart
from models.category import Category
from database.schemas import CounterpartSchema, CategorySchema, TransactionSchema
from .category_service import CategoryService
from .counterpart_service import CounterpartService
import logging
logger = setup_loggers()
logger.setLevel(logging.DEBUG)

class CSV_handler():
    def __init__(self, file: UploadFile):
        self.file = file
        self.category_service = CategoryService()
        self.counterpart_service = CounterpartService()
        self.transaction_service = TransactionService()

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
        logger.debug(f"Amount: {amount}")
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

    def convert_df_to_transactions(self, df: DataFrame):
        transactions: list[TransactionCreate] = []

        for _, row in df.iterrows():

            transaction_type: TransactionTypes = self.get_transaction_type(row["Bedrag"], row["Rekening tegenpartij"])
            date: str = self.convert_to_ISO_format(row["Boekingsdatum"])

            transaction: TransactionCreate = TransactionCreate(
                transaction_type = transaction_type,

                owner_account_number = row["Rekening"],
                counterpart_name = row["Naam tegenpartij bevat"],
                counterpart_account_number = row["Rekening tegenpartij"],
                value = float(row["Bedrag"]/ 100),  # The value is in cents
                date_executed = date,  # Convert to YYYY-MM-DD format
                description = row["Mededelingen"]
            )

            transactions.append(transaction)

        return transactions

    def export_counterparts(self, counterparts: list[str], db: Session):
        """
        Export all counterparts to the database.
        """
        # Get all previous counterparts
        counterparts_from_db = db.query(CounterpartSchema).all()

        # Convert them to set of Counterpart names
        existing_counterparts: set[str] = {counterpart.name.lower() for counterpart in counterparts_from_db}

        # Filter out counterparts that already exist
        new_counterparts = [CounterpartSchema(name=name) for name in counterparts if name.lower() not in existing_counterparts]

        # Add new counterparts to the database
        if new_counterparts:
            db.add_all(new_counterparts)
            db.commit()
            logger.info(f"Added {len(new_counterparts)} new counterparts to the database.")
        else:
            logger.info("No new counterparts to add to the database.")
        

    def process_file(self, db: Session = Depends(get_db)):
        # Convert file to DataFrame
        df: DataFrame = self.convert_to_df()
        df: DataFrame = self.clean_df(df)

        # Export all counterparts
        self.export_counterparts(df["Naam tegenpartij bevat"].unique(), db)

        # Convert DataFrame to transactions
        transactions: list[TransactionCreate] = self.convert_df_to_transactions(df)
        self.transaction_service.add_transactions(transactions, db)

        transactions: list[TransactionSchema] = self.transaction_service.get_all_transactions(db, as_schema=True)
        self.category_service.update_transaction_category(transactions, db)
        db.commit()
        
        logger.info("CSV file processed and transactions added successfully.")
