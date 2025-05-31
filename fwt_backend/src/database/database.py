from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine.url import URL
from .schemas import Base

URL_DATABASE: URL = URL.create(
    drivername="postgresql+psycopg2",
    username="postgres",
    password="password",
    host="localhost",
    port=5432,
    database="FinancialTracker"
)

engine = create_engine(URL_DATABASE)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)