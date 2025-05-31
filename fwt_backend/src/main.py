
from utils.logging import setup_loggers
from logging import Logger
from fastapi import FastAPI
from controllers.transaction_controller import transaction_controller
from exceptions.global_exception_handler import register_global_exception_handlers
logger: Logger = setup_loggers()
app = FastAPI()

app.include_router(transaction_controller)
register_global_exception_handlers(app)

@app.get("/")
async def root():
    return {"message": "Welcome to my Financial Tracker Website (FTW)"}