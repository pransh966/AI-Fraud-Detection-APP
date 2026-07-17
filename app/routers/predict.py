from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..ML.predictor import predict_transaction
from .. import oauth2

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)


@router.post("/")
def predict(
    transaction: dict,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user)
):

    result = predict_transaction(transaction)

    return result