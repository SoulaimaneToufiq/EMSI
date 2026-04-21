from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String(50), nullable=True)
    target_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    target_task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True)
    message = Column(Text, nullable=True)
    generated_at = Column(TIMESTAMP, server_default=func.now())
    is_acted_upon = Column(Boolean, default=False)

    target_user = relationship("User", foreign_keys=[target_user_id])
    target_task = relationship("Task", back_populates="ai_recommendations")
