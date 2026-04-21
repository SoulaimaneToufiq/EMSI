from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AIRecommendationCreate(BaseModel):
    type: Optional[str] = None
    target_user_id: Optional[int] = None
    target_task_id: Optional[int] = None
    message: str


class AIRecommendationUpdate(BaseModel):
    is_acted_upon: bool


class AIRecommendationOut(BaseModel):
    id: int
    type: Optional[str]
    target_user_id: Optional[int]
    target_task_id: Optional[int]
    message: Optional[str]
    generated_at: datetime
    is_acted_upon: bool

    model_config = {"from_attributes": True}
