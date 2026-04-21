from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TaskHistoryOut(BaseModel):
    id: int
    task_id: int
    changed_by: Optional[int]
    field_changed: Optional[str]
    old_value: Optional[str]
    new_value: Optional[str]
    changed_at: datetime

    model_config = {"from_attributes": True}
