from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import extract
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date as date_type
from collections import defaultdict

from models.models import SessionLocal, Expense, User
from routes.auth_fastapi import get_current_user, get_db
from utils.categorizer import categorize_expense

router = APIRouter(prefix="/api/expenses", tags=["expenses"])

class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: Optional[str] = None
    date: Optional[str] = None
    notes: Optional[str] = ""

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[str] = None
    notes: Optional[str] = None

class CategorizeRequest(BaseModel):
    title: str
    notes: Optional[str] = ""

def parse_date(date_str):
    if not date_str:
        return date_type.today()
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except Exception:
        return date_type.today()

@router.get("/")
def get_expenses(
    month: Optional[str] = None,
    category: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Expense).filter(Expense.user_id == user.id)
    if month:
        try:
            y, m = map(int, month.split('-'))
            query = query.filter(
                extract('year', Expense.date) == y,
                extract('month', Expense.date) == m
            )
        except Exception:
            pass
    if category:
        query = query.filter(Expense.category == category)

    expenses = query.order_by(Expense.date.desc()).all()
    return [e.to_dict() for e in expenses]

@router.post("/", status_code=201)
def add_expense(
    data: ExpenseCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    title = data.title.strip()
    amount = data.amount
    notes = data.notes or ""
    date_str = data.date or ""
    category = (data.category or "").strip()

    if not title:
        raise HTTPException(status_code=400, detail="Title is required")
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be a positive number")

    if not category:
        category = categorize_expense(title, notes)

    expense = Expense(
        user_id=user.id,
        title=title,
        amount=amount,
        category=category,
        date=parse_date(date_str),
        notes=notes
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense.to_dict()

@router.put("/{expense_id}")
def update_expense(
    expense_id: int,
    data: ExpenseUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    if data.title is not None:
        expense.title = data.title.strip()
    if data.amount is not None:
        if data.amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be a positive number")
        expense.amount = data.amount
    if data.notes is not None:
        expense.notes = data.notes
    if data.date is not None:
        expense.date = parse_date(data.date)
    
    if data.category is not None and data.category.strip():
        expense.category = data.category.strip()
    elif data.title is not None:
        # Re-categorize if title changed and no category was specified
        expense.category = categorize_expense(expense.title, expense.notes)

    db.commit()
    db.refresh(expense)
    return expense.to_dict()

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db.delete(expense)
    db.commit()
    return {"message": "Deleted"}

@router.post("/categorize")
def categorize(
    data: CategorizeRequest,
    user: User = Depends(get_current_user)
):
    category = categorize_expense(data.title, data.notes)
    return {"category": category}

@router.post("/public-categorize")
def public_categorize(data: CategorizeRequest):
    category = categorize_expense(data.title, data.notes)
    return {"category": category}

@router.get("/insights")
def insights(
    month: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Expense).filter(Expense.user_id == user.id)
    if month:
        try:
            y, m = map(int, month.split('-'))
            query = query.filter(
                extract('year', Expense.date) == y,
                extract('month', Expense.date) == m
            )
        except Exception:
            pass

    expenses = query.all()
    total = sum(e.amount for e in expenses)
    by_category = defaultdict(float)
    monthly = defaultdict(float)

    for e in expenses:
        by_category[e.category] += e.amount
        key = e.date.strftime('%Y-%m')
        monthly[key] += e.amount

    category_data = [
        {
            'category': k,
            'amount': round(v, 2),
            'percent': round(v / total * 100, 1) if total else 0
        }
        for k, v in sorted(by_category.items(), key=lambda x: -x[1])
    ]

    monthly_data = [
        {
            'month': k,
            'amount': round(v, 2)
        }
        for k, v in sorted(monthly.items())
    ]

    return {
        'total': round(total, 2),
        'count': len(expenses),
        'by_category': category_data,
        'monthly': monthly_data
    }
