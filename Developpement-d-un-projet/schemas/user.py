from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from enum import Enum


class RoleEnum(str, Enum):
    admin = "admin"
    manager = "manager"
    employee = "employee"


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: RoleEnum
    department_id: Optional[int] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[RoleEnum] = None
    department_id: Optional[int] = None
    is_active: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    email: str
    role: RoleEnum
    department_id: Optional[int]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenIn(BaseModel):
    refresh_token: str
