from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas
from app import model
from app.database import get_db
from app.oauth2 import get_current_user
from app.model import User

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)

@router.get("/", response_model=schemas.ProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.put("/", response_model=schemas.ProfileResponse)
def update_profile(
    request: schemas.ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: model.User = Depends(get_current_user)
):

    current_user.username = request.username

    if request.email:
        current_user.email = request.email

    db.commit()
    db.refresh(current_user)

    return current_user