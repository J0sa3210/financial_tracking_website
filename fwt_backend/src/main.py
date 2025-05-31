
from utils.logging import setup_loggers
from logging import Logger
from fastapi import FastAPI, Depends
from database import engine, get_db
from database.schemas import Base
import uvicorn
from controllers.transaction_controller import transaction_controller
from exceptions.global_exception_handler import register_global_exception_handlers
logger: Logger = setup_loggers()
app = FastAPI()


# Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

app.include_router(transaction_controller)
register_global_exception_handlers(app)

@app.get("/")
async def root():
    return {"message": "Welcome to my Financial Tracker Website (FTW)"}



# if __name__ == "__main__":
#     uvicorn.run(app, host="localhost", port=8000)