from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from sqlalchemy.sql import func

from database import Base


class WorkflowLog(Base):
    __tablename__ = "workflow_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    workflow_name = Column(String(100), nullable=True)
    executed_at = Column(TIMESTAMP, server_default=func.now())
    status = Column(String(50), nullable=True)
    tasks_processed = Column(Integer, nullable=True)
    errors = Column(Text, nullable=True)
    duration_ms = Column(Integer, nullable=True)
