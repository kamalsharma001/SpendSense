import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Float, Date, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from dotenv import load_dotenv

# Load environmental variables from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    sqlite_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'expenses.db')
    DATABASE_URL = f"sqlite:///{sqlite_path}"

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}
else:
    # Pass connection timeout to psycopg2
    connect_args = {"connect_timeout": 3}

# Attempt connection to Postgres, fallback to SQLite on failure (e.g. offline dev environments)
try:
    temp_engine = create_engine(DATABASE_URL, connect_args=connect_args)
    with temp_engine.connect() as conn:
        pass
    engine = temp_engine
    print("[Database] Successfully connected to Neon Postgres database.")
except Exception as e:
    print(f"[Database] Connection to primary DB failed ({e}). Falling back to local SQLite.")
    sqlite_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'expenses.db')
    DATABASE_URL = f"sqlite:///{sqlite_path}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    expenses = relationship('Expense', back_populates='user', cascade='all, delete-orphan')

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'email': self.email, 'created_at': self.created_at.isoformat()}

class Expense(Base):
    __tablename__ = 'expenses'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String(200), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(100), nullable=False)
    date = Column(Date, nullable=False)
    notes = Column(Text, default='')
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='expenses')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'amount': self.amount,
            'category': self.category,
            'date': self.date.isoformat(),
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }
