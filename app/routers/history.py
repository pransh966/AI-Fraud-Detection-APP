from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import model, schemas
from app.database import get_db
from app.oauth2 import get_current_user

router = APIRouter(
    prefix="/history",
    tags=["History"]
)

@router.get("/", response_model=list[schemas.HistoryResponse])
def get_history(
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user)
):

    history = (
        db.query(model.PredictionHistory)
        .filter(model.PredictionHistory.user_id == current_user.id)
        .order_by(model.PredictionHistory.created_at.desc())
        .all()
    )

    return history

@router.get("/{id}", response_model=schemas.HistoryResponse)
def get_history_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user)
):

    history = (
        db.query(model.PredictionHistory)
        .filter(
            model.PredictionHistory.id == id,
            model.PredictionHistory.user_id == current_user.id
        )
        .first()
    )

    if not history:
        raise HTTPException(
            status_code=404,
            detail="Prediction history not found."
        )

    return history

@router.delete("/{id}")
def delete_history(
    id: int,
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user)
):

    history = (
        db.query(model.PredictionHistory)
        .filter(
            model.PredictionHistory.id == id,
            model.PredictionHistory.user_id == current_user.id
        )
        .first()
    )

    if not history:
        raise HTTPException(
            status_code=404,
            detail="Prediction history not found."
        )

    db.delete(history)
    db.commit()

    return {
        "message": "Prediction history deleted successfully."
    }

@router.delete("/")
def delete_all_history(
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user)
):

    deleted = (
        db.query(model.PredictionHistory)
        .filter(
            model.PredictionHistory.user_id == current_user.id
        )
        .delete(synchronize_session=False)
    )

    db.commit()

    return {
        "message": "All prediction history deleted successfully.",
        "deleted_records": deleted
    }