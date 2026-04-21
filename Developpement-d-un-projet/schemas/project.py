from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel
from enum import Enum


class ProjectStatusEnum(str, Enum):
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    manager_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: ProjectStatusEnum = ProjectStatusEnum.active
    budget: Optional[Decimal] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    manager_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[ProjectStatusEnum] = None
    budget: Optional[Decimal] = None


class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    manager_id: Optional[int]
    start_date: Optional[date]
    end_date: Optional[date]
    status: ProjectStatusEnum
    budget: Optional[Decimal]
    created_at: datetime

    model_config = {"from_attributes": True}
