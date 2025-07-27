from fastapi import UploadFile
from utils.logging import setup_loggers
from pandas import read_csv, DataFrame
from io import BytesIO

logger = setup_loggers()

class CSV_handler():
    def __init__(self, file: UploadFile):
        self.file = file

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
        df.dropna(inplace=True)
        
        useful_columns =  [
        "Rekening",
        "Boekingsdatum",
        "Rekeninguittrekselnummer",
        "Rekening tegenpartij",
        "Naam tegenpartij bevat",
        "Transactie",
        "Bedrag",
        "Mededelingen"
        ]

        df = df[useful_columns]
        return df


    def process_file(self):
        # Convert file to DataFrame
        df: DataFrame = self.convert_to_df()
        df = self.clean_df(df)




        print(df.head(20))

