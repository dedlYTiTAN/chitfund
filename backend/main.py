from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from datetime import datetime, timedelta
from typing import List

import models
import schemas
from database import engine, get_db, Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title="Chit Fund API")

# Enable CORS for the Next.js frontend (local and Vercel deployments)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEST_USER_ID = "00000000-0000-0000-0000-000000000000"

payout_records = [
    {
        "id": "PAY-1082",
        "user_id": TEST_USER_ID,
        "user_name": "Test Investor",
        "phone_number": "+91 9876543210",
        "upi_id": "testinvestor@okhdfcbank",
        "amount": 250.0,
        "mode": "UPI Payout",
        "status": "PENDING",
        "created_at": "2026-10-10 14:32:00"
    }
]

@app.on_event("startup")
async def startup_event():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
    
    # Auto-seed test user
    async for db in get_db():
        result = await db.execute(select(models.User).where(models.User.id == TEST_USER_ID))
        user = result.scalar_one_or_none()
        if not user:
            new_user = models.User(
                id=TEST_USER_ID,
                full_name="Test Investor",
                phone_number="+91 9876543210",
                residential_address="123 Tech Park, Bangalore",
                role="CUSTOMER",
                upi_id="testinvestor@okhdfcbank"
            )
            db.add(new_user)
            
        ADMIN_USER_ID = "11111111-1111-1111-1111-111111111111"
        admin_result = await db.execute(select(models.User).where(models.User.id == ADMIN_USER_ID))
        admin = admin_result.scalar_one_or_none()
        if not admin:
            new_admin = models.User(
                id=ADMIN_USER_ID,
                full_name="Admin Manager",
                phone_number="+91 0000000000",
                residential_address="Admin Office",
                role="ADMIN",
                upi_id="admin@okhdfcbank"
            )
            db.add(new_admin)
            
        await db.commit()
        break

@app.post("/deposits/webhook", response_model=schemas.DepositOut)
async def simulate_deposit(payload: schemas.DepositWebhook, db: AsyncSession = Depends(get_db)):
    # Fetch user
    result = await db.execute(select(models.User).where(models.User.id == payload.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check deposit cap
    if user.total_active_principal + payload.amount > 10000:
        raise HTTPException(status_code=400, detail="Deposit cap of 10,000 INR exceeded")
    
    # Create deposit
    deposit = models.Deposit(
        user_id=user.id,
        principal_amount=payload.amount,
        deposit_date=datetime.utcnow(),
        principal_locked_until=datetime.utcnow() + timedelta(days=180) # 6 months
    )
    db.add(deposit)
    
    # Update user active principal
    user.total_active_principal += payload.amount
    
    await db.commit()
    await db.refresh(deposit)
    return deposit

@app.post("/withdrawals/request")
async def request_withdrawal(payload: schemas.WithdrawalRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.id == payload.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    amount_to_withdraw = payload.amount
    if amount_to_withdraw <= 0:
        raise HTTPException(status_code=400, detail="Invalid withdrawal amount")

    total_available = user.withdrawable_interest_balance

    # Calculate unlocked principal
    deposits_result = await db.execute(
        select(models.Deposit).where(
            models.Deposit.user_id == user.id,
            models.Deposit.status == models.DepositStatus.ACTIVE,
            models.Deposit.principal_locked_until <= datetime.utcnow()
        )
    )
    unlocked_deposits = deposits_result.scalars().all()
    unlocked_principal = sum(d.principal_amount for d in unlocked_deposits)
    
    total_available += unlocked_principal

    if amount_to_withdraw > total_available:
        raise HTTPException(status_code=400, detail="Insufficient withdrawable balance")
    
    # Deduct logic: First deduct from interest, then unlocked principal
    if amount_to_withdraw <= user.withdrawable_interest_balance:
        user.withdrawable_interest_balance -= amount_to_withdraw
    else:
        remaining_to_deduct = amount_to_withdraw - user.withdrawable_interest_balance
        user.withdrawable_interest_balance = 0.0
        
        for deposit in unlocked_deposits:
            if remaining_to_deduct <= 0:
                break
            if deposit.principal_amount <= remaining_to_deduct:
                remaining_to_deduct -= deposit.principal_amount
                user.total_active_principal -= deposit.principal_amount
                deposit.status = models.DepositStatus.WITHDRAWN
            else:
                # Partial withdrawal from a deposit isn't specified in strict rules, but assuming it's all or nothing per deposit for simplicity.
                # If we need partial, we can reduce principal_amount. Let's reduce principal_amount.
                deposit.principal_amount -= remaining_to_deduct
                user.total_active_principal -= remaining_to_deduct
                remaining_to_deduct = 0
                
    # Record in payout queue with UPI ID
    target_upi = payload.upi_id or getattr(user, "upi_id", None) or "investor@okhdfcbank"
    payout_id = f"PAY-{datetime.utcnow().strftime('%M%S')}"
    payout_records.append({
        "id": payout_id,
        "user_id": user.id,
        "user_name": user.full_name,
        "phone_number": user.phone_number,
        "upi_id": target_upi,
        "amount": float(amount_to_withdraw),
        "mode": "UPI Payout",
        "status": "PENDING",
        "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    })

    await db.commit()
    return {
        "payout_link": f"https://secure.gateway.com/pay/{payload.user_id}-mock-link",
        "payout_id": payout_id,
        "upi_id": target_upi
    }

@app.get("/portfolio/{user_id}", response_model=schemas.PortfolioResponse)
async def get_portfolio(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    deposits_result = await db.execute(
        select(models.Deposit).where(
            models.Deposit.user_id == user.id,
            models.Deposit.status == models.DepositStatus.ACTIVE
        )
    )
    active_deposits = deposits_result.scalars().all()
    
    locked_principal = 0
    unlocked_principal = 0
    now = datetime.utcnow()
    next_yield_date = None
    
    for deposit in active_deposits:
        if deposit.principal_locked_until > now:
            locked_principal += deposit.principal_amount
        else:
            unlocked_principal += deposit.principal_amount
            
        # Simplistic next yield date: assume exactly 30 days after deposit, and every 30 days thereafter
        # For display purpose, just find the next 30 day boundary
        days_since_deposit = (now - deposit.deposit_date).days
        days_to_next_yield = 30 - (days_since_deposit % 30)
        yield_date = now + timedelta(days=days_to_next_yield)
        
        if next_yield_date is None or yield_date < next_yield_date:
            next_yield_date = yield_date
            
    available_to_withdraw = user.withdrawable_interest_balance + unlocked_principal

    return schemas.PortfolioResponse(
        total_principal=user.total_active_principal,
        locked_principal=locked_principal,
        available_to_withdraw=available_to_withdraw,
        next_yield_date=next_yield_date
    )

@app.post("/dev/run-accruals")
async def run_accruals(db: AsyncSession = Depends(get_db)):
    # Scan all active deposits and insert 1% interest row
    deposits_result = await db.execute(
        select(models.Deposit).where(models.Deposit.status == models.DepositStatus.ACTIVE)
    )
    active_deposits = deposits_result.scalars().all()
    
    total_credited = 0
    for deposit in active_deposits:
        interest_amount = deposit.principal_amount * 0.01 # 1%
        accrual = models.InterestAccrual(
            deposit_id=deposit.id,
            amount=interest_amount,
            credited_on=datetime.utcnow()
        )
        db.add(accrual)
        
        # update user
        user_result = await db.execute(select(models.User).where(models.User.id == deposit.user_id))
        user = user_result.scalar_one_or_none()
             
        if user:
            user.withdrawable_interest_balance += interest_amount
        
        total_credited += interest_amount
        
    # Hack to simulate time jump for locked principal. 
    # For a real "Simulate +30 days", we would shift all dates back by 30 days. 
    # Let's shift all deposit dates and locked_until dates back by 30 days so the frontend shows it.
    for deposit in active_deposits:
        deposit.deposit_date -= timedelta(days=30)
        deposit.principal_locked_until -= timedelta(days=30)
        
    await db.commit()
    return {"message": f"Successfully simulated 30 days. Accrued {total_credited} INR interest."}

@app.get("/deposits/{user_id}", response_model=List[schemas.DepositOut])
async def get_user_deposits(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Deposit)
        .where(models.Deposit.user_id == user_id)
        .order_by(models.Deposit.deposit_date.desc())
    )
    return result.scalars().all()

@app.get("/users/", response_model=List[schemas.UserOut])
async def get_all_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).order_by(models.User.full_name))
    return result.scalars().all()

@app.get("/users/{user_id}", response_model=schemas.UserOut)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/users/", response_model=schemas.UserOut)
async def create_user(payload: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    hashed_password = pwd_context.hash(payload.password)
    new_user = models.User(
        full_name=payload.full_name,
        phone_number=payload.phone_number,
        residential_address=payload.residential_address,
        password_hash=hashed_password,
        role=payload.role,
        upi_id=payload.upi_id
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@app.put("/users/{user_id}", response_model=schemas.UserOut)
async def update_user(user_id: str, payload: schemas.UserUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.phone_number is not None:
        user.phone_number = payload.phone_number
    if payload.residential_address is not None:
        user.residential_address = payload.residential_address
    if payload.upi_id is not None:
        user.upi_id = payload.upi_id
        
    await db.commit()
    await db.refresh(user)
    return user

@app.post("/users/login")
async def login_user(payload: schemas.UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.id == payload.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.password_hash:
        # For the seeded test user that doesn't have a password
        if payload.password == "test" or payload.password == "":
            return {"success": True}
        raise HTTPException(status_code=401, detail="Invalid password")
    
    if not pwd_context.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    return {"success": True}

@app.get("/admin/metrics")
async def get_admin_metrics(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(func.sum(models.User.total_active_principal)))
    total_aum = result.scalar() or 0
    
    result = await db.execute(select(func.sum(models.User.withdrawable_interest_balance)))
    total_liabilities = result.scalar() or 0
    
    result = await db.execute(select(func.count(models.User.id)))
    total_users = result.scalar() or 0
    
    pending_payouts = [p for p in payout_records if p["status"] == "PENDING"]
    pending_count = len(pending_payouts)
    pending_amount = sum(p["amount"] for p in pending_payouts)

    return {
        "total_aum": total_aum,
        "total_liabilities": total_liabilities,
        "total_users": total_users,
        "pending_payouts_count": pending_count,
        "pending_payouts_amount": pending_amount
    }

@app.get("/admin/users", response_model=List[schemas.UserOut])
async def get_admin_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).order_by(models.User.full_name))
    return result.scalars().all()

@app.get("/admin/payouts")
async def get_admin_payouts():
    pending = [p for p in payout_records if p["status"] == "PENDING"]
    return {
        "payouts": payout_records,
        "pending_count": len(pending),
        "pending_amount": sum(p["amount"] for p in pending)
    }

@app.post("/admin/payouts/complete")
async def complete_payout_batch():
    settled_count = 0
    for p in payout_records:
        if p["status"] == "PENDING":
            p["status"] = "SETTLED"
            p["settled_at"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            settled_count += 1
    return {
        "message": f"Successfully processed batch of {settled_count} UPI payouts.",
        "settled_count": settled_count
    }

