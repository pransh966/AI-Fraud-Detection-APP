from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
import os
from ..database import get_db
from ..ML.predictor import predict_transaction, predict_batch_transactions
from .. import oauth2

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)

from ..schemas import PredictionRequest, PredictionResponse, BatchPredictionResponse

@router.post("/", response_model=PredictionResponse)
def predict(
    request: PredictionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user)
):
    return predict_transaction(request.data)


@router.post("/batch", response_model=BatchPredictionResponse)
def predict_batch(
    file: UploadFile = File(...),
    current_user=Depends(oauth2.get_current_user)
):
    return predict_batch_transactions(file)


@router.get("/download/{filename}")
def download_file(
    filename: str,
    current_user=Depends(oauth2.get_current_user)
):

    path = os.path.join("outputs", filename)

    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
