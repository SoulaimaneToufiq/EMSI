from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.config import settings
from database import get_db
from models.anomaly import Anomaly
from models.notification import Notification
from models.task import Task
from models.user import User
from models.workflow_log import WorkflowLog
from schemas.workflow_log import WorkflowLogCreate, WorkflowLogOut

router = APIRouter(prefix="/webhooks", tags=["Webhooks n8n"])


def verify_secret(x_webhook_secret: str = Header(...)):
    if x_webhook_secret != settings.WEBHOOK_SECRET:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook secret")


# ── Pydantic payloads ────────────────────────────────────────────

class AnomalyPayload(BaseModel):
    task_id: int
    actual_hours: float
    estimated_hours: float


class NotifyDelaysPayload(BaseModel):
    task_ids: List[int]


# ── Data endpoints (n8n polls these) ─────────────────────────────

@router.get("/delayed-tasks")
def get_delayed_tasks(
    db: Session = Depends(get_db),
    _: None = Depends(verify_secret),
):
    """
    Polled by n8n at 18:00 daily.
    Returns delayed tasks with assignee email so n8n can send alerts.
    """
    now = datetime.utcnow()
    tasks = (
        db.query(Task)
        .filter(Task.deadline < now, Task.status.notin_(["completed", "cancelled"]))
        .all()
    )
    result = []
    for task in tasks:
        user = db.query(User).filter(User.id == task.assigned_to).first() if task.assigned_to else None
        result.append({
            "id": task.id,
            "title": task.title,
            "status": task.status,
            "priority": task.priority,
            "deadline": task.deadline.isoformat() if task.deadline else None,
            "days_overdue": (now - task.deadline).days if task.deadline else 0,
            "delay_count": task.delay_count,
            "assigned_to": task.assigned_to,
            "assigned_email": user.email if user else None,
            "assigned_name": user.email.split("@")[0].replace(".", " ").title() if user else None,
            "project_id": task.project_id,
        })
    return {"count": len(result), "tasks": result}


@router.get("/kpi-report")
def get_kpi_report(
    db: Session = Depends(get_db),
    _: None = Depends(verify_secret),
):
    """
    Polled by n8n every Monday and on the 1st of each month.
    Returns aggregated KPIs for PDF report generation.
    """
    now = datetime.utcnow()
    tasks = db.query(Task).all()
    users = db.query(User).filter(User.is_active == True).all()

    total = len(tasks)
    counts = {"todo": 0, "in_progress": 0, "review": 0, "completed": 0, "cancelled": 0}
    delayed = 0
    for t in tasks:
        counts[t.status] = counts.get(t.status, 0) + 1
        if t.deadline and t.status not in ("completed", "cancelled") and now > t.deadline:
            delayed += 1

    completion_rate = round(counts["completed"] / total * 100, 2) if total > 0 else 0.0

    user_stats = []
    for user in users:
        user_tasks = [t for t in tasks if t.assigned_to == user.id]
        user_delayed = sum(
            1 for t in user_tasks
            if t.deadline and t.status not in ("completed", "cancelled") and now > t.deadline
        )
        user_completed = sum(1 for t in user_tasks if t.status == "completed")
        user_stats.append({
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "total_tasks": len(user_tasks),
            "completed": user_completed,
            "delayed": user_delayed,
            "completion_rate": round(user_completed / len(user_tasks) * 100, 2) if user_tasks else 0,
        })

    return {
        "generated_at": now.isoformat(),
        "total_tasks": total,
        "completed_tasks": counts["completed"],
        "delayed_tasks": delayed,
        "completion_rate": completion_rate,
        "by_status": counts,
        "user_stats": sorted(user_stats, key=lambda u: u["delayed"], reverse=True),
    }


@router.get("/time-anomalies")
def get_time_anomalies(
    db: Session = Depends(get_db),
    _: None = Depends(verify_secret),
):
    """
    Polled by n8n in real-time via webhook trigger.
    Returns tasks where actual_hours > estimated_hours.
    """
    tasks = (
        db.query(Task)
        .filter(
            Task.actual_hours.isnot(None),
            Task.estimated_hours.isnot(None),
            Task.actual_hours > Task.estimated_hours,
            Task.status.notin_(["cancelled"]),
        )
        .all()
    )
    result = []
    for t in tasks:
        overrun_pct = round((t.actual_hours / t.estimated_hours - 1) * 100, 1)
        result.append({
            "id": t.id,
            "title": t.title,
            "status": t.status,
            "estimated_hours": t.estimated_hours,
            "actual_hours": t.actual_hours,
            "overrun_pct": overrun_pct,
            "assigned_to": t.assigned_to,
            "project_id": t.project_id,
        })
    return {"count": len(result), "tasks": result}


# ── Action endpoints (n8n posts to these) ────────────────────────

@router.post("/anomaly", status_code=status.HTTP_201_CREATED)
def report_anomaly(
    payload: AnomalyPayload,
    db: Session = Depends(get_db),
    _: None = Depends(verify_secret),
):
    """
    Called by n8n when actual_hours > estimated_hours on a task update.
    Creates an anomaly record and an in-app notification for the assignee.
    """
    task = db.query(Task).filter(Task.id == payload.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    overrun_pct = round((payload.actual_hours / payload.estimated_hours - 1) * 100, 1)
    if overrun_pct < 25:
        severity = "low"
    elif overrun_pct < 75:
        severity = "medium"
    elif overrun_pct < 150:
        severity = "high"
    else:
        severity = "critical"

    anomaly = Anomaly(
        task_id=task.id,
        type="time_overrun",
        severity=severity,
        details={
            "actual_hours": payload.actual_hours,
            "estimated_hours": payload.estimated_hours,
            "overrun_pct": overrun_pct,
        },
    )
    db.add(anomaly)

    if task.assigned_to:
        db.add(Notification(
            user_id=task.assigned_to,
            task_id=task.id,
            type="anomaly",
            message=(
                f"Time anomaly on '{task.title}': {overrun_pct:.0f}% over estimate "
                f"({payload.actual_hours}h logged vs {payload.estimated_hours}h estimated)."
            ),
        ))

    db.commit()
    return {"status": "created", "severity": severity, "overrun_pct": overrun_pct}


@router.post("/notify-delays", status_code=status.HTTP_201_CREATED)
def notify_delays(
    payload: NotifyDelaysPayload,
    db: Session = Depends(get_db),
    _: None = Depends(verify_secret),
):
    """
    Called by n8n after sending daily delay emails.
    Creates in-app notifications for all affected assignees.
    """
    created = 0
    for task_id in payload.task_ids:
        task = db.query(Task).filter(Task.id == task_id).first()
        if task and task.assigned_to:
            db.add(Notification(
                user_id=task.assigned_to,
                task_id=task.id,
                type="delay_alert",
                message=f"Your task '{task.title}' is overdue. Please update its status or contact your manager.",
            ))
            created += 1
    db.commit()
    return {"status": "ok", "notifications_created": created}


@router.post("/log", response_model=WorkflowLogOut, status_code=status.HTTP_201_CREATED)
def log_workflow(
    data: WorkflowLogCreate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_secret),
):
    """Called by n8n at the end of every workflow to record its execution."""
    log = WorkflowLog(**data.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
