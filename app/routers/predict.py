from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import database, oauth2

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)


@router.post("/")
def predict(
    current_user = Depends(oauth2.get_current_user),
    db: Session = Depends(database.get_db)
):
    return {
        "message": "Prediction endpoint is working!"
    }
