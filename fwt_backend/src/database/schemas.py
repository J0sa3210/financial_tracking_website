from sqlalchemy.orm import declarative_base
from sqlalchemy import Integer, Column, String, Float, Date, Time, DateTime
from datetime import datetime


Base = declarative_base()

class TransactionSchema(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_type = Column(String, index=True)
    value = Column(Float, index=True)
    description = Column(String)
    date_executed = Column(Date, index=True)
    time_executed = Column(Time, index=True)
    
    time_created = Column(DateTime, default=datetime.now())
    time_updated = Column(DateTime, default=datetime.now(), onupdate=datetime.now())