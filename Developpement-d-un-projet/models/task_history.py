from sqlalchemy import Column, ForeignKey, Integer, String, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class TaskHistory(Base):
    __tablename__ = "task_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    field_changed = Column(String(100), nullable=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    changed_at = Column(TIMESTAMP, server_default=func.now())

    task = relationship("Task", back_populates="history")
    changed_by_user = relationship("User", back_populates="task_history")
