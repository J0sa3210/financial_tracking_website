class FormattingException(Exception):
    def __init__(self, field: type, value: str):
        self.field: str = field
        self.value: str = value
        self.msg: str = f"Error formatting {self.value} for {self.field}."

class FileTypeExpection(Exception):
    def __init__(self, file_type: str):
        self.file_type: str = file_type
        self.msg: str = f"Unsupported file type: {self.file_type}. Only CSV files are allowed."