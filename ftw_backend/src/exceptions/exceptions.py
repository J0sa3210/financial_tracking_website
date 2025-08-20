class FormattingException(Exception):
    def __init__(self, field: type, value: str):
        self.field: str = field
        self.value: str = value
        self.msg: str = f"Error formatting {self.value} for {self.field}."

class FileTypeExpection(Exception):
    def __init__(self, file_type: str):
        self.file_type: str = file_type
        self.msg: str = f"Unsupported file type: {self.file_type}. Only CSV files are allowed."

class ObjectNotFoundException(Exception):
    def __init__(self, object_type: str, object_identifier: str):
        self.object_type: str = object_type
        self.object_identifier: str = object_identifier
        self.msg: str = f"{self.object_type} with identifier {self.object_identifier} not found."

class AccountNotFoundException(ObjectNotFoundException):
    def __init__(self, object_identifier):
        super().__init__("Account", object_identifier)

class CategoryNotFoundException(ObjectNotFoundException):
    def __init__(self, object_identifier):
        super().__init__("Category", object_identifier)
