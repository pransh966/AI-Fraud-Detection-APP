from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import model, schemas
from app.database import get_db
from app.oauth2 import get_current_user

router = APIRouter(
    prefix="/batch-history",
    tags=["Batch History"]
)


@router.get("/", response_model=list[schemas.BatchHistoryResponse])
def get_batch_history(
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user)
):

    history = (
        db.query(model.BatchPrediction)
        .filter(model.BatchPrediction.user_id == current_user.id)
        .order_by(model.BatchPrediction.created_at.desc())
        .all()
    )
    if not history:
        raise HTTPException(
            status_code=404,
            detail="No batch prediction history found."
        )

    return history

@router.get("/{id}", response_model=schemas.BatchHistoryResponse)
def get_batch_history_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user)
):

    batch = (
        db.query(model.BatchPrediction)
        .filter(
            model.BatchPrediction.id == id,
            model.BatchPrediction.user_id == current_user.id
        )
        .first()
    )

    if not batch:
        raise HTTPException(
            status_code=404,
            detail="Batch history not found."
        )

    return batch

@router.delete("/{id}")
def delete_batch_history(
    id: int,
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user)
):

    batch = (
        db.query(model.BatchPrediction)
        .filter(
            model.BatchPrediction.id == id,
            model.BatchPrediction.user_id == current_user.id
        )
        .first()
    )

    if not batch:
        raise HTTPException(
            status_code=404,
            detail="Batch history not found."
        )

    db.delete(batch)
    db.commit()

    return {
        "message": "Batch history deleted successfully."
    }

@router.delete("/")
def delete_all_batch_history(
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user)
):

    deleted = (
        db.query(model.BatchPrediction)
        .filter(
            model.BatchPrediction.user_id == current_user.id
        )
        .delete(synchronize_session=False)
    )

    db.commit()

    return {
        "message": "All batch history deleted successfully.",
        "deleted_records": deleted
    }

