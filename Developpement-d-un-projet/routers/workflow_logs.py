from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user, require_admin
from database import get_db
from models.user import User
from models.workflow_log import WorkflowLog
from schemas.workflow_log import WorkflowLogCreate, WorkflowLogOut

router = APIRouter(prefix="/workflow-logs", tags=["Logs Workflows n8n"])


@router.post("/", response_model=WorkflowLogOut, status_code=status.HTTP_201_CREATED)
def create_log(
    data: WorkflowLogCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    Endpoint appelé par n8n à la fin de chaque workflow pour enregistrer
    le résultat d'exécution (statut, tâches traitées, erreurs, durée).
    """
    log = WorkflowLog(**data.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/", response_model=List[WorkflowLogOut])
def list_logs(
    workflow_name: Optional[str] = None,
    log_status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    query = db.query(WorkflowLog)
    if workflow_name:
        query = query.filter(WorkflowLog.workflow_name == workflow_name)
    if log_status:
        query = query.filter(WorkflowLog.status == log_status)
    return (
        query.order_by(WorkflowLog.executed_at.desc())
        .offset(skip)
        .limit(min(limit, 200))
        .all()
    )


@router.get("/{log_id}", response_model=WorkflowLogOut)
def get_log(
    log_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    log = db.query(WorkflowLog).filter(WorkflowLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log introuvable")
    return log
