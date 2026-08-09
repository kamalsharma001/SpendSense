import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include sub-routers
app.include_router(auth_router)
app.include_router(expenses_router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "framework": "fastapi"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)