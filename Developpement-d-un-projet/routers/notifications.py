from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from database import get_db
from models.notification import Notification
from models.user import User
from schemas.notification import NotificationCreate, NotificationOut

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationOut])
def list_notifications(
    unread_only: bool = False,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).offset(skip).limit(min(limit, 200)).all()


@router.patch("/{notif_id}/read", response_model=NotificationOut)
def mark_as_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id,
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.patch("/read-all", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()


# Endpoint utilisé par n8n pour créer des notifications
@router.post("/", response_model=NotificationOut, status_code=status.HTTP_201_CREATED)
def create_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    notif = Notification(**data.model_dump())
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif
