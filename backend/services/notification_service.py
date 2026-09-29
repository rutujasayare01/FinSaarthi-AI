import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from backend.models.all_models import Notification, NotificationPreference, User

logger = logging.getLogger("finsaarthi.notifications")

class NotificationService:
    """
    Multi-channel notification service supporting In-App, Web Push, and Email architectures.
    """

    NOTIFICATION_TYPES = [
        "NEW_SCHEME",
        "SCHEME_UPDATED",
        "DEADLINE_APPROACHING",
        "DOCUMENT_REQUIRED",
        "ELIGIBILITY_CHANGED",
        "SAVED_SCHEME_UPDATE"
    ]

    @classmethod
    def create_notification(
        cls,
        db: Session,
        user_id: int,
        title: str,
        message: str,
        notification_type: str = "NEW_SCHEME",
        action_url: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        channel: str = "IN_APP"
    ) -> Notification:
        # Check user notification preferences
        pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == user_id).first()
        if pref and pref.frequency == "OFF":
            logger.info("Notification suppressed: User %s has notifications set to OFF", user_id)

        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            channel=channel,
            action_url=action_url,
            metadata_json=metadata or {},
            is_read=False,
            created_at=datetime.utcnow()
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)

        logger.info("Created notification [%s] for user %d: %s", notification_type, user_id, title)
        return notification

    @classmethod
    def get_user_notifications(cls, db: Session, user_id: int, unread_only: bool = False) -> List[Notification]:
        query = db.query(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            query = query.filter(Notification.is_read == False)
        return query.order_by(Notification.created_at.desc()).all()

    @classmethod
    def mark_as_read(cls, db: Session, notification_id: int, user_id: int) -> bool:
        notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
        if notif:
            notif.is_read = True
            db.commit()
            return True
        return False

    @classmethod
    def mark_all_as_read(cls, db: Session, user_id: int) -> int:
        count = db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).update({"is_read": True})
        db.commit()
        return count

notification_service = NotificationService()
