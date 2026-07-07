import fastapi

app = fastapi.FastAPI(title="AI Fraud Detection API")

@app.get("/")
def home():
    return {"message": "Server is running!"}
