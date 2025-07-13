
from logging import Logger
from fastapi import FastAPI
from utils.logging import setup_loggers
from fastapi.middleware.cors import CORSMiddleware
from controllers.transaction_controller import transaction_controller
from exceptions.global_exception_handler import register_global_exception_handlers
logger: Logger = setup_loggers()
app = FastAPI()

app.include_router(transaction_controller)
register_global_exception_handlers(app)

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to my Financial Tracker Website (FTW)"}