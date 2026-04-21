from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from enum import Enum


class TaskStatusEnum(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    review = "review"
    completed = "completed"
    cancelled = "cancelled"


class TaskPriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    project_id: Optional[int] = None
    deadline: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    priority: TaskPriorityEnum = TaskPriorityEnum.medium


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    project_id: Optional[int] = None
    deadline: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    status: Optional[TaskStatusEnum] = None
    priority: Optional[TaskPriorityEnum] = None
    risk_score: Optional[float] = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    assigned_to: Optional[int]
    created_by: Optional[int]
    project_id: Optional[int]
    deadline: Optional[datetime]
    estimated_hours: Optional[float]
    actual_hours: Optional[float]
    status: TaskStatusEnum
    priority: TaskPriorityEnum
    delay_count: int
    consecutive_delays: int
    risk_score: float
    created_at: datetime

    model_config = {"from_attributes": True}


class TaskDashboardStats(BaseModel):
    total: int
    todo: int
    in_progress: int
    review: int
    completed: int
    cancelled: int
    delayed: int
    completion_rate: float
