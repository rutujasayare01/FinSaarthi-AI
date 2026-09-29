from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.all_models import Notification, NotificationPreference, User
from backend.schemas.all_schemas import NotificationOut, NotificationPreferenceOut, NotificationPreferenceUpdate
from backend.services.notification_service import notification_service
from backend.api.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications & Alerts"])

@router.get("", response_model=List[NotificationOut])
def get_notifications(
    unread_only: bool = False,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return notification_service.get_user_notifications(db, user_id=user.id, unread_only=unread_only)

@router.put("/{notification_id}/read")
def mark_read(
    notification_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = notification_service.mark_as_read(db, notification_id=notification_id, user_id=user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@router.put("/read-all")
def mark_all_read(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = notification_service.mark_all_as_read(db, user_id=user.id)
    return {"message": f"{count} notifications marked as read"}

@router.get("/preferences", response_model=NotificationPreferenceOut)
def get_preferences(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == user.id).first()
    if not pref:
        pref = NotificationPreference(user_id=user.id, frequency="INSTANT", email_enabled=True, push_enabled=True, in_app_enabled=True)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@router.put("/preferences", response_model=NotificationPreferenceOut)
def update_preferences(
    data: NotificationPreferenceUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == user.id).first()
    if not pref:
        pref = NotificationPreference(user_id=user.id)
        db.add(pref)

    for field, val in data.dict(exclude_unset=True).items():
        if val is not None:
            setattr(pref, field, val)
    db.commit()
    db.refresh(pref)
    return pref

@router.post("/trigger-demo-alert")
def trigger_demo_alert(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates the proactive scheme alert specified in hackathon scenario Section 18."""
    notif = notification_service.create_notification(
        db=db,
        user_id=user.id,
        title="🆕 A new education scheme may match you",
        message="Based on your profile and recent searches for 'Maharashtra scholarship', you may qualify for 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna'.",
        notification_type="NEW_SCHEME",
        action_url="/schemes/1",
        metadata={
            "scheme_id": 1,
            "status": "ELIGIBLE",
            "confidence": "HIGH"
        }
    )
    return {"message": "Proactive alert dispatched successfully", "notification_id": notif.id}
