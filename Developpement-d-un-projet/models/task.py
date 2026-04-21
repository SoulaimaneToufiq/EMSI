from sqlalchemy import (
    Column, DateTime, Enum, Float, ForeignKey,
    Integer, String, Text, TIMESTAMP
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True, index=True)
    deadline = Column(DateTime, nullable=True, index=True)
    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, nullable=True)
    status = Column(
        Enum("todo", "in_progress", "review", "completed", "cancelled"),
        default="todo",
        index=True,
    )
    priority = Column(Enum("low", "medium", "high"), default="medium")
    delay_count = Column(Integer, default=0)
    consecutive_delays = Column(Integer, default=0)
    risk_score = Column(Float, default=0.0)
    created_at = Column(TIMESTAMP, server_default=func.now())

    assignee = relationship("User", back_populates="tasks_assigned", foreign_keys=[assigned_to])
    creator = relationship("User", back_populates="tasks_created", foreign_keys=[created_by])
    project = relationship("Project", back_populates="tasks")
    history = relationship("TaskHistory", back_populates="task", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="task", cascade="all, delete-orphan")
    anomalies = relationship("Anomaly", back_populates="task", cascade="all, delete-orphan")
    ai_predictions = relationship("AIPrediction", back_populates="task", cascade="all, delete-orphan")
    ai_recommendations = relationship("AIRecommendation", back_populates="target_task", cascade="all, delete-orphan")
