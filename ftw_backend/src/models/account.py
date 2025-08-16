from pydantic import BaseModel, AfterValidator
from typing import Annotated

def is_IBAN(iban: str) -> str:
    # Spaties en hoofdletters normaliseren
    iban = iban.replace(" ", "").upper()

    # 1. Controleer landcode en lengte
    if not iban.startswith("BE") or len(iban) != 16:
        raise ValueError("IBAN has wrong length (must be 16 characters) or wrong landcode (must be BE)")

    # 2. Controleer dat de rest cijfers bevat
    if not iban[2:].isdigit():
        raise ValueError("The last 14 characters must be digits.")

    # 3. IBAN-check: verplaats eerste 4 tekens naar het einde
    rearranged = iban[4:] + iban[:4]

    # 4. Vervang letters door cijfers (A=10, B=11, ..., Z=35)
    numeric_iban = ""
    for ch in rearranged:
        if ch.isdigit():
            numeric_iban += ch
        else:
            numeric_iban += str(ord(ch) - 55)  # 'A' -> 10, 'B' -> 11, ...

    # 5. Controleer modulo 97
    if not int(numeric_iban) % 97 == 1:
        raise ValueError("The control code is not correct.")
    
    return iban

class Account(BaseModel):
    id: int
    name: str
    iban: Annotated[str, AfterValidator(is_IBAN)]

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class AccountCreate(BaseModel):
    name: str
    iban: Annotated[str, AfterValidator(is_IBAN)]


    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class AccountEdit(BaseModel):
    name: str = None
    iban: Annotated[str, AfterValidator(is_IBAN)] = None

    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}

class AccountView(BaseModel):
    id: int
    name: str
    iban: Annotated[str, AfterValidator(is_IBAN)]


    # Ensures we can easily convert from schema to model
    model_config = {'from_attributes': True}
