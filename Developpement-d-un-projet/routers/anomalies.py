from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user, require_manager_or_admin
from database import get_db
from models.anomaly import Anomaly
from models.user import User
from schemas.anomaly import AnomalyCreate, AnomalyOut, AnomalyResolve

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])


@router.post("/", response_model=AnomalyOut, status_code=status.HTTP_201_CREATED)
def create_anomaly(
    data: AnomalyCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager_or_admin),
):
    anomaly = Anomaly(**data.model_dump())
    db.add(anomaly)
    db.commit()
    db.refresh(anomaly)
    return anomaly


@router.get("/", response_model=List[AnomalyOut])
def list_anomalies(
    task_id: Optional[int] = None,
    severity: Optional[str] = None,
    resolved: Optional[bool] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager_or_admin),
):
    query = db.query(Anomaly)
    if task_id:
        query = query.filter(Anomaly.task_id == task_id)
    if severity:
        query = query.filter(Anomaly.severity == severity)
    if resolved is True:
        query = query.filter(Anomaly.resolved_at.isnot(None))
    elif resolved is False:
        query = query.filter(Anomaly.resolved_at.is_(None))
    return query.order_by(Anomaly.detected_at.desc()).offset(skip).limit(min(limit, 200)).all()


@router.get("/{anomaly_id}", response_model=AnomalyOut)
def get_anomaly(
    anomaly_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager_or_admin),
):
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomalie introuvable")
    return anomaly


@router.patch("/{anomaly_id}/resolve", response_model=AnomalyOut)
def resolve_anomaly(
    anomaly_id: int,
    data: AnomalyResolve,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager_or_admin),
):
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomalie introuvable")
    if anomaly.resolved_at:
        raise HTTPException(status_code=400, detail="Anomalie déjà résolue")
    anomaly.resolved_at = data.resolved_at or datetime.utcnow()
    db.commit()
    db.refresh(anomaly)
    return anomaly
