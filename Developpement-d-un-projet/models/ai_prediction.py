from sqlalchemy import Column, Float, ForeignKey, Integer, JSON, String, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    delay_probability = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    model_version = Column(String(50), nullable=True)
    features = Column(JSON, nullable=True)
    predicted_at = Column(TIMESTAMP, server_default=func.now())

    task = relationship("Task", back_populates="ai_predictions")
