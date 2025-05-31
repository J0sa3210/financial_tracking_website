class FormattingException(Exception):
    def __init__(self, field: type, value: str):
        self.field: str = field
        self.value: str = value
        self.msg: str = f"Error formatting {self.value} for {self.field}."