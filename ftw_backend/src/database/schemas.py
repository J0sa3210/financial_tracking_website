from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Integer, Column, String, Float, Date, DateTime, ForeignKey
from datetime import datetime


Base = declarative_base()

class TransactionSchema(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_type = Column(String, index=True)
    transaction_category = Column(String, index=True)

    transaction_owner_account_number = Column(String, index=True)
    transaction_counterpart_name = Column(String, index=True)
    transaction_counterpart_account_number = Column(String, index=True)

    value = Column(Float, index=True)
    description = Column(String)
    date_executed = Column(Date, index=True)
    


    time_created = Column(DateTime, default=datetime.now())
    time_updated = Column(DateTime, default=datetime.now(), onupdate=datetime.now())

class CategorySchema(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)

    counterparts = relationship("CounterpartSchema", back_populates="category")

class CounterpartSchema(Base):
    __tablename__ = "counterparts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship("CategorySchema", back_populates="counterparts")