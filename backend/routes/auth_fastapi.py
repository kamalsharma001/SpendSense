from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from models.models import SessionLocal, User
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'super-secret-key-change-in-prod')
ALGORITHM = "HS256"

# Helper database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schemas
class SignUpRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    token: str
    new_password: str

# Token Helpers
def create_access_token(user_id: int):
    payload = {"sub": str(user_id)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user_id(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return int(user_id)
    except Exception:
        return None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    uid = get_current_user_id(token)
    if uid is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == uid).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/signup", status_code=201)
def signup(data: SignUpRequest, db: Session = Depends(get_db)):
    name = data.name.strip()
    email = data.email.strip().lower()
    password = data.password

    if not name or not email or not password:
        raise HTTPException(status_code=400, detail="All fields are required")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return {"token": token, "user": user.to_dict()}

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    password = data.password

    user = db.query(User).filter(User.email == email).first()
    if not user or not check_password_hash(user.password_hash, password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id)
    return {"token": token, "user": user.to_dict()}

@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return user.to_dict()

# Security Forget Password endpoints (mocking token send for demo simplicity and robustness)
@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Prevent user enumeration: always return same response
        return {"message": "If this email exists in our system, a password reset token has been sent."}
    
    # Generate reset token
    # In production, this would be emailed. For this demo, we'll return a token in response
    # to let the UI easily complete the flow.
    reset_token = f"SS-RESET-{user.id}-99"
    return {
        "message": "If this email exists in our system, a password reset token has been sent.",
        "debug_token": reset_token  # Provided for easy offline demo/testing
    }

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    token = data.token.strip()
    new_password = data.new_password

    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    expected_token = f"SS-RESET-{user.id}-99"
    if token != expected_token:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user.password_hash = generate_password_hash(new_password)
    db.commit()
    return {"message": "Password reset successful. You can now log in with your new password."}
