import fastapi

from app.routers import auth

app = fastapi.FastAPI(title="AI Fraud Detection API")
app.include_router(auth.router)


@app.get("/")
def home():
    return {"message": "Server is running!"}
