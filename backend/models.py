import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class DepositStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    WITHDRAWN = "WITHDRAWN"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    residential_address = Column(Text, nullable=False)
    password_hash = Column(String, nullable=True)
    role = Column(String, default="CUSTOMER")
    upi_id = Column(String, nullable=True)
    total_active_principal = Column(Integer, default=0)
    withdrawable_interest_balance = Column(Float, default=0.0)

    deposits = relationship("Deposit", back_populates="user")

class Deposit(Base):
    __tablename__ = "deposits"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, ForeignKey("users.id"))
    principal_amount = Column(Integer, nullable=False)
    deposit_date = Column(DateTime, default=datetime.utcnow)
    principal_locked_until = Column(DateTime, nullable=False)
    status = Column(Enum(DepositStatus), default=DepositStatus.ACTIVE)

    user = relationship("User", back_populates="deposits")
    interest_accruals = relationship("InterestAccrual", back_populates="deposit")

class InterestAccrual(Base):
    __tablename__ = "interest_accruals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    deposit_id = Column(String, ForeignKey("deposits.id"))
    amount = Column(Float, nullable=False)
    credited_on = Column(DateTime, default=datetime.utcnow)

    deposit = relationship("Deposit", back_populates="interest_accruals")
