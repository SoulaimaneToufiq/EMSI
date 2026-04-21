from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user, require_manager_or_admin
from database import get_db
from models.ai_recommendation import AIRecommendation
from models.user import User
from schemas.ai_recommendation import (
    AIRecommendationCreate,
    AIRecommendationOut,
    AIRecommendationUpdate,
)

router = APIRouter(prefix="/ai/recommendations", tags=["IA - Recommandations"])


@router.post("/", response_model=AIRecommendationOut, status_code=status.HTTP_201_CREATED)
def create_recommendation(
    data: AIRecommendationCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    Endpoint appelé par le service IA pour enregistrer une recommandation
    intelligente (redistribution de charge, réévaluation d'estimation, etc.).
    """
    reco = AIRecommendation(**data.model_dump())
    db.add(reco)
    db.commit()
    db.refresh(reco)
    return reco


@router.get("/", response_model=List[AIRecommendationOut])
def list_recommendations(
    target_user_id: Optional[int] = None,
    target_task_id: Optional[int] = None,
    is_acted_upon: Optional[bool] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager_or_admin),
):
    query = db.query(AIRecommendation)
    if target_user_id:
        query = query.filter(AIRecommendation.target_user_id == target_user_id)
    if target_task_id:
        query = query.filter(AIRecommendation.target_task_id == target_task_id)
    if is_acted_upon is not None:
        query = query.filter(AIRecommendation.is_acted_upon == is_acted_upon)
    return (
        query.order_by(AIRecommendation.generated_at.desc())
        .offset(skip)
        .limit(min(limit, 200))
        .all()
    )


@router.get("/{reco_id}", response_model=AIRecommendationOut)
def get_recommendation(
    reco_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager_or_admin),
):
    reco = db.query(AIRecommendation).filter(AIRecommendation.id == reco_id).first()
    if not reco:
        raise HTTPException(status_code=404, detail="Recommandation introuvable")
    return reco


@router.patch("/{reco_id}/act", response_model=AIRecommendationOut)
def mark_acted_upon(
    reco_id: int,
    data: AIRecommendationUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager_or_admin),
):
    """
    Le manager marque une recommandation comme traitée (acceptée ou rejetée).
    """
    reco = db.query(AIRecommendation).filter(AIRecommendation.id == reco_id).first()
    if not reco:
        raise HTTPException(status_code=404, detail="Recommandation introuvable")
    reco.is_acted_upon = data.is_acted_upon
    db.commit()
    db.refresh(reco)
    return reco
