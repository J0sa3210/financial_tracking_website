from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine.url import URL
from .schemas import Base

# Database information
URL_DATABASE: URL = URL.create(
    drivername="postgresql+psycopg2",
    username="postgres",
    password="password",
    host="db",
    port=5432,
    database="FinancialTracker"
)

engine = create_engine(URL_DATABASE)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Helper function
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Drop all schemas
# Base.metadata.drop_all(bind=engine)

Base.metadata.create_all(bind=engine)