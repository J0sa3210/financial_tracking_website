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
import re
from datetime import datetime
import logging
logger = setup_loggers()
logger.setLevel(logging.DEBUG)

class CSV_handler():
    # ======================================================================================================== #
    #                                       SETUP FUNCTIONS
    # ======================================================================================================== # 

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
        
    def process_file(self, owner_account: Account, db: Session = Depends(get_db)):
        # Convert file to DataFrame
        df: DataFrame = self._convert_to_df()
        df: DataFrame = self._clean_df(df)

        
        # Export all different owner account numbers
        owner_ibans: list[str] = df["Rekening"].unique().tolist()
        
        for owner_iban in owner_ibans:
            logger.debug(f"Processing transactions for account number: {owner_iban}")
            try:
                owner_account : Account = self.account_service.get_account_by_iban(db=db, iban=owner_iban)
                
                # Gather all present counterparts. If not present, add them to the database
                counterpart_map: dict[str, CounterpartSchema] = self._export_counterparts(df["Naam tegenpartij bevat"].unique(), db, owner_id=owner_account.id)
                
                # Convert DataFrame to transactions
                new_transactions: list[TransactionCreate] = self._convert_df_to_transactions(df, counterpart_map=counterpart_map)
                added_transaction: list[TransactionSchema] = self.transaction_service.add_transactions(new_transactions=new_transactions, db=db, active_account=owner_account)

                # Ensure pending inserts are sent to the DB so subsequent Query.update() in
                # _sync_transactions_for_counterpart can find and update the new rows.
                db.flush()
                
                # Add/sync counterparts with categories
                for counterpart in counterpart_map.values():
                    if counterpart.category_id is not None:
                        logger.debug(f"Adding counterpart {counterpart.name} to category {counterpart.category_id}")
                        category: CategorySchema = self.category_service.get_category(db=db, category_id=counterpart.category_id, as_schema=True, owner_id=owner_account.id)
                        self.category_service.add_counterpart_to_category(category=category, counterpart=counterpart, db=db, owner_account=owner_account)

                logger.info("CSV file processed and transactions added successfully.")
            
            except AccountNotFoundException as e:
                logger.error(f"Error processing transactions for account number {owner_iban}: {e.msg}")
                continue
    
    # ======================================================================================================== #
    #                                       HELPER FUNCTIONS
    # ======================================================================================================== #
    
    def _convert_to_df(self):
        # Read the file contents
        content = self.read_file()

        csv_file = BytesIO(content)
        # Load in using pandas
        df: DataFrame = read_csv(csv_file, delimiter=";")
        return df

    def _clean_df(self, df: DataFrame) -> DataFrame:
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
    
    def _convert_to_ISO_format(self, date_str: str) -> str:
        """
        Convert a date string to ISO format (YYYY-MM-DD).
        Accepts common formats like DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD and falls
        back to splitting non-digit separators. Always zero-pads month/day.
        """
        try:
            s = str(date_str).strip()
            # try common exact formats first
            for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%Y/%m/%d"):
                try:
                    return datetime.strptime(s, fmt).date().isoformat()
                except ValueError:
                    continue

            # fallback: split by non-digit characters and reconstruct
            parts = re.split(r"\D+", s)
            parts = [p for p in parts if p]
            if len(parts) >= 3:
                # prefer day, month, year unless year looks like it's first
                if len(parts[0]) == 4:
                    y, m, d = parts[0], parts[1], parts[2]
                else:
                    d, m, y = parts[0], parts[1], parts[2]

                return f"{int(y):04d}-{int(m):02d}-{int(d):02d}"

            raise ValueError(f"Unrecognized date format: {date_str}")

        except Exception as e:
            logger.error(f"Error converting date to ISO format: {e} (input: {date_str})")
            raise e

    def _convert_df_to_transactions(self, df: DataFrame, counterpart_map: dict[str, CounterpartSchema] = {}) -> list[TransactionCreate]:
        transactions: list[TransactionCreate] = []

        for _, row in df.iterrows():

            transaction_type: TransactionTypes = TransactionTypes.NONE
            counterpart: CounterpartSchema = counterpart_map[row["Naam tegenpartij bevat"]]
            date: str = self._convert_to_ISO_format(row["Boekingsdatum"])

            transaction: TransactionCreate = TransactionCreate(
                transaction_type = transaction_type,

                owner_iban = row["Rekening"],
                counterpart_name = row["Naam tegenpartij bevat"],
                counterpart_id = counterpart.id,
                counterpart_iban = row["Rekening tegenpartij"],
                value = float(row["Bedrag"].replace(",",".")),  # The value is in euros
                date_executed = date,  # Convert to YYYY-MM-DD format
                description = row["Mededelingen"]
            )

            transactions.append(transaction)

        return transactions

    def _export_counterparts(self, counterparts: list[str], db: Session, owner_id: int):
        """
        Export all counterparts to the database.
        """
        counterparts_map: dict[str, CounterpartSchema] = {}
        # Add new counterparts to the database
        for cp_name in counterparts:
            if cp_name not in counterparts_map.keys():
                cp: CounterpartSchema = self.counterpart_service.create_counterpart(new_counterpart=CounterpartCreate(name=cp_name, owner_id=owner_id), db=db, owner_id=owner_id)
                counterparts_map[cp.name] = cp

        return counterparts_map

