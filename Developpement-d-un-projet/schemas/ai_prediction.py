from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel


class AIPredictionCreate(BaseModel):
    task_id: int
    delay_probability: Optional[float] = None
    confidence_score: Optional[float] = None
    model_version: Optional[str] = None
    features: Optional[Dict[str, Any]] = None


class AIPredictionOut(BaseModel):
    id: int
    task_id: int
    delay_probability: Optional[float]
    confidence_score: Optional[float]
    model_version: Optional[str]
    features: Optional[Dict[str, Any]]
    predicted_at: datetime

    model_config = {"from_attributes": True}
