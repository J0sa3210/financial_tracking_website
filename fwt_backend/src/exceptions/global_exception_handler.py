from fastapi import Request, FastAPI
from sqlalchemy.exc import NoResultFound
from fastapi.exceptions import HTTPException, RequestValidationError
from .exceptions import FormattingException
import logging

logger: logging.Logger = logging.getLogger(__name__) 

def register_global_exception_handlers(app: FastAPI):
    @app.exception_handler(NoResultFound)
    async def no_result_found_exception_handler(request: Request, exc: NoResultFound):
        item_name: str = list(request.path_params.keys())[0]
        item_name_parsed: str = item_name.split("_")[0].capitalize()
        item_id: int = request.path_params[item_name]
        raise HTTPException(status_code=404, detail=f"{item_name_parsed} {item_id} was not found")

    @app.exception_handler(FormattingException)
    async def request_validation_error(request: Request, exc: FormattingException):
        logger.error(exc.msg)
        raise HTTPException(
            status_code=400,
            detail=exc.msg
        )
    