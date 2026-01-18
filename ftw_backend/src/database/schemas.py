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

    owner_iban = Column(String, index=True)
    counterpart_id = Column(Integer, ForeignKey("counterparts.id"), nullable=True)
    counterpart_name = Column(String, index=True)
    counterpart = relationship("CounterpartSchema", foreign_keys=[counterpart_id], back_populates="transactions")

    value = Column(Float, index=True)
    description = Column(String)
    date_executed = Column(Date, index=True)
    
    time_created = Column(DateTime, default=datetime.now)
    time_updated = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class CategorySchema(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, index=True)

    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    category_type = Column(String, default="None")

    # ensure counterparts are removed when a Category is removed in the ORM
    counterparts = relationship(
        "CounterpartSchema",
        back_populates="category",
        foreign_keys="CounterpartSchema.category_id",
    )

    transactions = relationship("TransactionSchema", back_populates="category")

class CounterpartSchema(Base):
    __tablename__ = "counterparts"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, index=True)
    name = Column(String, index=True)

    transactions = relationship("TransactionSchema", back_populates="counterpart")

    # define FK column first so relationship can reference it unambiguously
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    # relationship referencing the FK
    category = relationship(
        "CategorySchema",
        back_populates="counterparts",
        foreign_keys=[category_id],
        
    )

class AccountSchema(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    iban = Column(String, index=True)
