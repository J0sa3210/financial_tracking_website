from pydantic import BaseModel
# ======================================================================================================== #
#                                       HELPER ENUMS
# ======================================================================================================== #

class CategoryType(BaseModel):
    id: int = None

    name: str = ""
    color: str = ""
    icon: str = ""
    is_positive: bool = True

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class CategoryTypeTableView(BaseModel):
    id: int = None
    name: str = None

    @classmethod
    def from_schema(cls, ct) -> "CategoryTypeTableView":
        return cls(
            id = ct.id,
            name = ct.name
        )