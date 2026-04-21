from datetime import datetime
from sqlalchemy.orm import Session

from models.task import Task
from models.task_history import TaskHistory
from models.notification import Notification


def record_history(db: Session, task: Task, changed_by: int, field: str, old_val, new_val):
    """Enregistre un changement dans task_history."""
    entry = TaskHistory(
        task_id=task.id,
        changed_by=changed_by,
        field_changed=field,
        old_value=str(old_val) if old_val is not None else None,
        new_value=str(new_val) if new_val is not None else None,
    )
    db.add(entry)


def create_notification(db: Session, user_id: int, task_id: int, notif_type: str, message: str):
    """Crée une notification in-app pour un utilisateur."""
    notif = Notification(
        user_id=user_id,
        task_id=task_id,
        type=notif_type,
        message=message,
    )
    db.add(notif)


def check_and_flag_delay(task: Task) -> bool:
    """Retourne True si la tâche est en retard."""
    if task.deadline and task.status not in ("completed", "cancelled"):
        return datetime.utcnow() > task.deadline
    return False


def apply_task_update(
    db: Session,
    task: Task,
    updates: dict,
    current_user_id: int,
):
    """
    Applique les modifications sur la tâche, enregistre l'historique
    pour chaque champ modifié, et gère les notifications liées au statut.
    """
    for field, new_value in updates.items():
        old_value = getattr(task, field)
        if old_value != new_value:
            record_history(db, task, current_user_id, field, old_value, new_value)
            setattr(task, field, new_value)

            # Notification si le statut change et qu'une tâche est assignée
            if field == "status" and task.assigned_to:
                create_notification(
                    db,
                    user_id=task.assigned_to,
                    task_id=task.id,
                    notif_type="status_change",
                    message=f"La tâche '{task.title}' est passée au statut '{new_value}'.",
                )

    # Recalcul du retard
    if check_and_flag_delay(task):
        task.delay_count += 1
        task.consecutive_delays += 1
    else:
        task.consecutive_delays = 0
