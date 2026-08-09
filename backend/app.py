import os
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Initialize dotenv before database loading
load_dotenv()

from models.models import engine, Base
from routes.auth_fastapi import router as auth_router
from routes.expenses_fastapi import router as expenses_router

# Initialize database schemas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SpendSense API",
    description="Futuristic AI-powered expense tracking and categorization service",
    version="2.0.0"
)

# CORS configuration restricted to authorized domains
origins = [
    "https://spendsense-xyz.netlify.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    # Prevent Clickjacking
    response.headers["X-Frame-Options"] = "DENY"
    # Prevent Cross-Site Scripting (XSS)
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # Prevent MIME Sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    # Protect Referrer Info
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Include sub-routers
app.include_router(auth_router)
app.include_router(expenses_router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "framework": "fastapi"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)