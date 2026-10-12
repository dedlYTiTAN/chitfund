import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from models import DepositStatus

UPI_REGEX = r"^[\w.-]+@[\w.-]+$"

class DepositWebhook(BaseModel):
    user_id: str
    amount: int

class WithdrawalRequest(BaseModel):
    user_id: str
    amount: float
    upi_id: Optional[str] = None

    @field_validator("upi_id")
    @classmethod
    def validate_upi_id(cls, v: Optional[str]) -> Optional[str]:
        if v and not re.match(UPI_REGEX, v):
            raise ValueError("Invalid UPI ID format. Must match standard format (e.g. user@okhdfcbank)")
        return v

class PortfolioResponse(BaseModel):
    total_principal: int
    locked_principal: int
    available_to_withdraw: float
    next_yield_date: Optional[datetime] = None

class DepositOut(BaseModel):
    id: str
    principal_amount: int
    deposit_date: datetime
    principal_locked_until: datetime
    status: DepositStatus

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    full_name: str
    phone_number: str
    residential_address: str
    password: str
    role: str = "CUSTOMER"
    upi_id: str = Field(default="investor@okhdfcbank", description="Indian UPI ID (e.g. user@okhdfcbank)")

    @field_validator("upi_id")
    @classmethod
    def validate_upi_id(cls, v: str) -> str:
        if not re.match(UPI_REGEX, v):
            raise ValueError("Invalid UPI ID format. Must match standard format (e.g. username@okhdfcbank)")
        return v

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    residential_address: Optional[str] = None
    upi_id: Optional[str] = None

    @field_validator("upi_id")
    @classmethod
    def validate_upi_id(cls, v: Optional[str]) -> Optional[str]:
        if v and not re.match(UPI_REGEX, v):
            raise ValueError("Invalid UPI ID format. Must match standard format (e.g. username@okhdfcbank)")
        return v

class UserLogin(BaseModel):
    user_id: str
    password: str

class UserOut(BaseModel):
    id: str
    full_name: str
    phone_number: str
    residential_address: Optional[str] = None
    role: str
    upi_id: Optional[str] = None
    total_active_principal: int
    withdrawable_interest_balance: float

    class Config:
        from_attributes = True
