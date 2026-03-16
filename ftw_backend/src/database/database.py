from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine.url import URL
from .schemas import Base, CategoryTypeSchema

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

def create_category_types():
    db = SessionLocal()
    existing = db.query(CategoryTypeSchema).count()

    if existing == 0:
        db.add_all([
                CategoryTypeSchema(
                    name="Income",
                    color="#16A34A",  # green
                    icon="plus",
                    is_positive=True,
                ),
                CategoryTypeSchema(
                    name="Expenses",
                    color="#EF4444",  # red
                    icon="minus",
                    is_positive=False,
                ),
                CategoryTypeSchema(
                    name="Savings",
                    color="#F59E0B",  # amber
                    icon="piggy-bank",
                    is_positive=True,
                ),
            ])
        db.commit()

    db.close()


# Drop all schemas
# Base.metadata.drop_all(bind=engine)

Base.metadata.create_all(bind=engine)
create_category_types()