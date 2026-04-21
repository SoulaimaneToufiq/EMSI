from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user, require_manager_or_admin
from database import get_db
from models.ai_prediction import AIPrediction
from models.task import Task
from models.user import User
from schemas.ai_prediction import AIPredictionCreate, AIPredictionOut

router = APIRouter(prefix="/ai/predictions", tags=["IA - Prédictions"])


@router.post("/", response_model=AIPredictionOut, status_code=status.HTTP_201_CREATED)
def create_prediction(
    data: AIPredictionCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    Endpoint appelé par le service IA Python (FastAPI ML) pour enregistrer
    une prédiction de retard sur une tâche.
    """
    task = db.query(Task).filter(Task.id == data.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tâche introuvable")

    prediction = AIPrediction(**data.model_dump())
    db.add(prediction)

    # Mise à jour du risk_score sur la tâche
    if data.delay_probability is not None:
        task.risk_score = round(data.delay_probability * 100, 2)

    db.commit()
    db.refresh(prediction)
    return prediction


@router.get("/", response_model=List[AIPredictionOut])
def list_predictions(
    task_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager_or_admin),
):
    query = db.query(AIPrediction)
    if task_id:
        query = query.filter(AIPrediction.task_id == task_id)
    return (
        query.order_by(AIPrediction.predicted_at.desc())
        .offset(skip)
        .limit(min(limit, 200))
        .all()
    )


@router.get("/high-risk", response_model=List[AIPredictionOut])
def list_high_risk_predictions(
    threshold: float = 0.75,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager_or_admin),
):
    """
    Retourne les dernières prédictions dont la probabilité de retard
    dépasse le seuil configurable (défaut : 75%).
    """
    return (
        db.query(AIPrediction)
        .filter(AIPrediction.delay_probability >= threshold)
        .order_by(AIPrediction.predicted_at.desc())
        .limit(200)
        .all()
    )


@router.get("/{prediction_id}", response_model=AIPredictionOut)
def get_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager_or_admin),
):
    prediction = db.query(AIPrediction).filter(AIPrediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prédiction introuvable")
    return prediction
