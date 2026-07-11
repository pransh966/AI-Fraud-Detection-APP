from pydantic import BaseModel, EmailStr, conint
from datetime import datetime
from typing import Optional


class User_Create(BaseModel):
    username: str
    email: EmailStr
    password: str

class User_Login(BaseModel):
    email: EmailStr
    password: str

class User_Response(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

class Prediction_Request(BaseModel):
    data: dict

class Prediction_Response(BaseModel):
    prediction: str
    probability: float
    risk_level: str

class User_History(BaseModel):
    id: int
    user_id: int
    prediction: str
    probability: float
    risk_level: str
    created_at: datetime

    class Config:
        from_attributes = True

class token(BaseModel):
    access_token:str
    token_type:str

class TokenData(BaseModel):
    id: Optional[int] = None

    