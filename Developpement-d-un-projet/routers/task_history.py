from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from database import get_db
from models.task import Task
from models.task_history import TaskHistory
from models.user import User
from schemas.task_history import TaskHistoryOut

router = APIRouter(prefix="/tasks/{task_id}/history", tags=["Historique des tâches"])


@router.get("/", response_model=List[TaskHistoryOut])
def get_task_history(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    if current_user.role == "employee" and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    return (
        db.query(TaskHistory)
        .filter(TaskHistory.task_id == task_id)
        .order_by(TaskHistory.changed_at.desc())
        .all()
    )
