from sqlalchemy import Column, Enum, ForeignKey, Integer, JSON, String, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=True)
    severity = Column(Enum("low", "medium", "high", "critical"), nullable=True)
    details = Column(JSON, nullable=True)
    detected_at = Column(TIMESTAMP, server_default=func.now())
    resolved_at = Column(TIMESTAMP, nullable=True)

    task = relationship("Task", back_populates="anomalies")
