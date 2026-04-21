from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class WorkflowLogCreate(BaseModel):
    workflow_name: Optional[str] = None
    status: Optional[str] = None
    tasks_processed: Optional[int] = None
    errors: Optional[str] = None
    duration_ms: Optional[int] = None


class WorkflowLogOut(BaseModel):
    id: int
    workflow_name: Optional[str]
    executed_at: datetime
    status: Optional[str]
    tasks_processed: Optional[int]
    errors: Optional[str]
    duration_ms: Optional[int]

    model_config = {"from_attributes": True}
