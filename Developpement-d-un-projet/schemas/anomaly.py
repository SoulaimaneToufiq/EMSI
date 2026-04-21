from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel
from enum import Enum


class SeverityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class AnomalyCreate(BaseModel):
    task_id: int
    type: Optional[str] = None
    severity: Optional[SeverityEnum] = None
    details: Optional[Dict[str, Any]] = None


class AnomalyResolve(BaseModel):
    resolved_at: Optional[datetime] = None


class AnomalyOut(BaseModel):
    id: int
    task_id: int
    type: Optional[str]
    severity: Optional[SeverityEnum]
    details: Optional[Dict[str, Any]]
    detected_at: datetime
    resolved_at: Optional[datetime]

    model_config = {"from_attributes": True}
