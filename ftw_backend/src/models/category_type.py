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