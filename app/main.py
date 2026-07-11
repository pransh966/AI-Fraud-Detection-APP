from fastapi import FastAPI

from app.database import Base, engine
from app.routers import auth, predict
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Fraud Detection API",
    version="1.0.0",
    description="AI-powered Fraud Detection System using FastAPI and LightGBM"
)

app.include_router(auth.router)
app.include_router(predict.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to AI Fraud Detection API"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }