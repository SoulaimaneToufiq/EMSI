from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, String, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("admin", "manager", "employee"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    department = relationship("Department", back_populates="users", foreign_keys=[department_id])
    tasks_assigned = relationship("Task", back_populates="assignee", foreign_keys="Task.assigned_to")
    tasks_created = relationship("Task", back_populates="creator", foreign_keys="Task.created_by")
    notifications = relationship("Notification", back_populates="user")
    task_history = relationship("TaskHistory", back_populates="changed_by_user")
