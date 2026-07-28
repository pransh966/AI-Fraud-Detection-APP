from fastapi import FastAPI
from app.database import Base, engine
from app.routers import auth, dashboard, history, predict, profile,batch_history
from fastapi.exceptions import RequestValidationError
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.routers.exceptions import http_exception_handler,validation_exception_handler,global_exception_handler


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Fraud Detection API",
    version="1.0.0",
    description="AI-powered Fraud Detection System using FastAPI and LightGBM"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(history.router)
app.include_router(batch_history.router)
app.include_router(profile.router)
app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(dashboard.router)
app.add_exception_handler(
    HTTPException,
    http_exception_handler
)

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler
)

app.add_exception_handler(
    Exception,
    global_exception_handler
)

 
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

