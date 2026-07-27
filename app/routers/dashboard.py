from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import model
from app.database import get_db
from app.oauth2 import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/")
def dashboard(
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user)
):

    total_predictions = db.query(model.PredictionHistory).filter(
        model.PredictionHistory.user_id == current_user.id
    ).count()

    fraud_predictions = db.query(model.PredictionHistory).filter(
        model.PredictionHistory.user_id == current_user.id,
        model.PredictionHistory.prediction == "Fraud"
    ).count()

    legitimate_predictions = total_predictions - fraud_predictions

    total_batches = db.query(model.BatchPrediction).filter(
        model.BatchPrediction.user_id == current_user.id
    ).count()

    total_transactions = db.query(
        func.coalesce(func.sum(model.BatchPrediction.total_transactions), 0)
    ).filter(
        model.BatchPrediction.user_id == current_user.id
    ).scalar()

    average_probability = db.query(
        func.avg(model.PredictionHistory.probability)
    ).filter(
        model.PredictionHistory.user_id == current_user.id
    ).scalar()

    return {
        "total_predictions": total_predictions,
        "fraud_predictions": fraud_predictions,
        "legitimate_predictions": legitimate_predictions,
        "total_batches": total_batches,
        "total_transactions_processed": total_transactions,
        "average_probability": round(average_probability or 0, 4)
    }


@router.get("/statistics")
def statistics(
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user)
):

    high = db.query(model.PredictionHistory).filter(
        model.PredictionHistory.user_id == current_user.id,
        model.PredictionHistory.risk_level == "High"
    ).count()

    medium = db.query(model.PredictionHistory).filter(
        model.PredictionHistory.user_id == current_user.id,
        model.PredictionHistory.risk_level == "Medium"
    ).count()

    low = db.query(model.PredictionHistory).filter(
        model.PredictionHistory.user_id == current_user.id,
        model.PredictionHistory.risk_level == "Low"
    ).count()

    total = high + medium + low

    fraud = db.query(model.PredictionHistory).filter(
        model.PredictionHistory.user_id == current_user.id,
        model.PredictionHistory.prediction == "Fraud"
    ).count()

    fraud_rate = round((fraud / total * 100), 2) if total else 0

    return {
        "high_risk": high,
        "medium_risk": medium,
        "low_risk": low,
        "fraud_rate": fraud_rate
    }

@router.get("/recent-predictions")
def recent_predictions(
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user)
):

    history = (
        db.query(model.PredictionHistory)
        .filter(
            model.PredictionHistory.user_id == current_user.id
        )
        .order_by(model.PredictionHistory.created_at.desc())
        .limit(5)
        .all()
    )

    return history