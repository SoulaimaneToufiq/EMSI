from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user, require_manager_or_admin
from database import get_db
from models.task import Task
from models.user import User
from schemas.task import TaskCreate, TaskDashboardStats, TaskOut, TaskUpdate
from services.task_service import apply_task_update

router = APIRouter(prefix="/tasks", tags=["Tâches"])


@router.post("/", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(**data.model_dump(), created_by=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/dashboard", response_model=TaskDashboardStats)
def dashboard_stats(
    project_id: Optional[int] = None,
    assigned_to: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Task)

    # Un employé ne voit que ses tâches
    if current_user.role == "employee":
        query = query.filter(Task.assigned_to == current_user.id)
    else:
        if assigned_to:
            query = query.filter(Task.assigned_to == assigned_to)

    if project_id:
        query = query.filter(Task.project_id == project_id)

    tasks = query.all()
    total = len(tasks)
    now = datetime.utcnow()

    counts = {"todo": 0, "in_progress": 0, "review": 0, "completed": 0, "cancelled": 0}
    delayed = 0
    for t in tasks:
        counts[t.status] = counts.get(t.status, 0) + 1
        if t.deadline and t.status not in ("completed", "cancelled") and now > t.deadline:
            delayed += 1

    completion_rate = round((counts["completed"] / total * 100), 2) if total > 0 else 0.0

    return TaskDashboardStats(
        total=total,
        todo=counts["todo"],
        in_progress=counts["in_progress"],
        review=counts["review"],
        completed=counts["completed"],
        cancelled=counts["cancelled"],
        delayed=delayed,
        completion_rate=completion_rate,
    )


@router.get("/delayed", response_model=List[TaskOut])
def list_delayed_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    now = datetime.utcnow()
    return (
        db.query(Task)
        .filter(Task.deadline < now, Task.status.notin_(["completed", "cancelled"]))
        .all()
    )


@router.get("/", response_model=List[TaskOut])
def list_tasks(
    skip: int = 0,
    limit: int = 50,
    project_id: Optional[int] = None,
    assigned_to: Optional[int] = None,
    task_status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Task)

    if current_user.role == "employee":
        query = query.filter(Task.assigned_to == current_user.id)
    else:
        if assigned_to:
            query = query.filter(Task.assigned_to == assigned_to)

    if project_id:
        query = query.filter(Task.project_id == project_id)
    if task_status:
        query = query.filter(Task.status == task_status)
    if priority:
        query = query.filter(Task.priority == priority)

    return query.offset(skip).limit(min(limit, 200)).all()


@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    if current_user.role == "employee" and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    return task


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tâche introuvable")

    # Un employé ne peut modifier que le statut de ses propres tâches
    if current_user.role == "employee":
        if task.assigned_to != current_user.id:
            raise HTTPException(status_code=403, detail="Accès refusé")
        allowed = {"status", "actual_hours"}
        updates = {k: v for k, v in data.model_dump(exclude_none=True).items() if k in allowed}
    else:
        updates = data.model_dump(exclude_none=True)

    apply_task_update(db, task, updates, current_user.id)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager_or_admin),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    db.delete(task)
    db.commit()
