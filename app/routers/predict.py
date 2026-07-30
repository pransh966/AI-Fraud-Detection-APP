from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
import os
from typing import Optional
from ..database import get_db
from ..ML.predictor import predict_transaction, predict_batch_transactions
from .. import oauth2
from .. import model


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
    result = predict_transaction(request.data, threshold=request.threshold)

    
    history = model.PredictionHistory(
        user_id=current_user.id,
        transaction_data=request.data,
        prediction=result["label"],
        probability=result["probability"],
        risk_level=result["risk_level"]
    )

    db.add(history)
    db.commit()

    return result

@router.post("/batch", response_model=BatchPredictionResponse)
def predict_batch(
    file: UploadFile = File(...),
    threshold: Optional[float] = Form(None),
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user)
):
    
    result = predict_batch_transactions(file, threshold=threshold)
    
    batch = model.BatchPrediction(
        user_id=current_user.id,
        filename=result["output_file"],
        total_transactions=result["total_transactions"],
        fraud_transactions=result["fraud_transactions"],
        legitimate_transactions=result["legitimate_transactions"],
        average_probability=result["average_fraud_probability"]
    )

    db.add(batch)
    db.commit()

    return result

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
