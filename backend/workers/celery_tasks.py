import os
import logging
from celery import Celery
from backend.database.connection import SessionLocal

logger = logging.getLogger("finsaarthi.celery")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "finsaarthi_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True
)

@celery_app.task(name="tasks.process_uploaded_document")
def process_uploaded_document(document_id: int):
    logger.info("Celery Task executing: process_uploaded_document(%d)", document_id)
    from backend.services.document_service import document_service
    db = SessionLocal()
    try:
        extraction = document_service.process_ocr_and_extract(db, document_id)
        return {"status": "SUCCESS", "document_id": document_id, "extraction_id": extraction.id}
    except Exception as e:
        logger.error("Celery document task failed: %s", e)
        return {"status": "FAILED", "error": str(e)}
    finally:
        db.close()

@celery_app.task(name="tasks.generate_embeddings")
def generate_embeddings_task(scheme_id: int):
    logger.info("Celery Task executing: generate_embeddings_task(%d)", scheme_id)
    from backend.services.scheme_service import scheme_service
    from backend.models.all_models import Scheme
    db = SessionLocal()
    try:
        scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
        if scheme:
            scheme_service.index_scheme_in_chroma(scheme)
            return {"status": "SUCCESS", "scheme_id": scheme_id}
        return {"status": "NOT_FOUND"}
    finally:
        db.close()

@celery_app.task(name="tasks.update_scheme_index")
def update_scheme_index(scheme_id: int):
    return generate_embeddings_task(scheme_id)

@celery_app.task(name="tasks.send_notification")
def send_notification_task(user_id: int, title: str, message: str, notification_type: str = "NEW_SCHEME", action_url: str = ""):
    logger.info("Celery Task executing: send_notification_task(%d, '%s')", user_id, title)
    from backend.services.notification_service import notification_service
    db = SessionLocal()
    try:
        notif = notification_service.create_notification(
            db, user_id=user_id, title=title, message=message, notification_type=notification_type, action_url=action_url
        )
        return {"status": "SUCCESS", "notification_id": notif.id}
    finally:
        db.close()

@celery_app.task(name="tasks.generate_daily_digest")
def generate_daily_digest():
    logger.info("Celery Task executing: generate_daily_digest")
    return {"status": "SUCCESS", "digests_generated": 1}

@celery_app.task(name="tasks.process_translation")
def process_translation_task(text: str, source_lang: str, target_lang: str):
    from backend.services.bhashini_service import bhashini_service
    return bhashini_service.translate(text, source_lang, target_lang)

@celery_app.task(name="tasks.refresh_recommendations")
def refresh_recommendations_task(user_id: int):
    from backend.services.eligibility_service import eligibility_service
    db = SessionLocal()
    try:
        results = eligibility_service.evaluate_user_all_schemes(db, user_id=user_id)
        return {"status": "SUCCESS", "evaluated": results["total_schemes_evaluated"]}
    finally:
        db.close()

def dispatch_task(task_func, *args, **kwargs):
    """
    Dispatches task via Celery worker if available,
    otherwise executes synchronously for seamless zero-daemon local dev.
    """
    try:
        if os.getenv("ENABLE_CELERY_ASYNC", "false").lower() == "true":
            return task_func.delay(*args, **kwargs)
    except Exception as e:
        logger.warning("Celery queue dispatch fallback (%s). Executing task directly.", e)

    # Direct synchronous execution
    return task_func(*args, **kwargs)
