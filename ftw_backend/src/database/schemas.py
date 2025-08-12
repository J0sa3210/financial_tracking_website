from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Integer, Column, String, Float, Date, DateTime, ForeignKey
from datetime import datetime

Base = declarative_base()

class TransactionSchema(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_type = Column(String, index=True)
    
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    category_name = Column(String)
    category = relationship("CategorySchema", back_populates="transactions", foreign_keys=[category_id])

    owner_account_number = Column(String, index=True)
    counterpart_name = Column(String, index=True)
    counterpart_account_number = Column(String, index=True)

    value = Column(Float, index=True)
    description = Column(String)
    date_executed = Column(Date, index=True)
    
    time_created = Column(DateTime, default=datetime.now)
    time_updated = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class CategorySchema(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)

    transactions = relationship("TransactionSchema", back_populates="category")
    counterparts = relationship("CounterpartSchema", back_populates="category")

class CounterpartSchema(Base):
    __tablename__ = "counterparts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    category = relationship("CategorySchema", back_populates="counterparts")

class AccountSchema(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    bank_account = Column(String, index=True)
