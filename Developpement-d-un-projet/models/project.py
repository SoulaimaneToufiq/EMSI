from sqlalchemy import Column, Date, Enum, ForeignKey, Integer, Numeric, String, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    manager_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(Enum("active", "completed", "cancelled"), default="active")
    budget = Column(Numeric(10, 2), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    manager = relationship("User", foreign_keys=[manager_id])
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
