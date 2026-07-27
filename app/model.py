from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    batch_predictions = relationship(
        "BatchPrediction",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    prediction_history = relationship(
        "PredictionHistory",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class BatchPrediction(Base):
    __tablename__ = "batch_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    filename = Column(String)
    total_transactions = Column(Integer)
    fraud_transactions = Column(Integer)
    legitimate_transactions = Column(Integer)
    average_probability = Column(Float)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="batch_predictions")

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    transaction_data = Column(JSON, nullable=False)

    prediction = Column(String(50), nullable=False)

    probability = Column(Float, nullable=False)

    risk_level = Column(String(20), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="prediction_history")



    