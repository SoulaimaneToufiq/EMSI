from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class NotificationCreate(BaseModel):
    user_id: int
    task_id: Optional[int] = None
    type: Optional[str] = None
    message: str


class NotificationOut(BaseModel):
    id: int
    user_id: int
    task_id: Optional[int]
    type: Optional[str]
    message: Optional[str]
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}
