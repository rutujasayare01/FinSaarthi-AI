from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.all_models import User
from backend.schemas.all_schemas import AssistantMessageRequest, AssistantMessageResponse
from backend.ai.rag_pipeline import rag_pipeline
from backend.api.auth import get_current_user

router = APIRouter(prefix="/assistant", tags=["FinSaarthi AI Assistant"])

@router.post("/chat", response_model=AssistantMessageResponse)
def chat_with_assistant(
    req: AssistantMessageRequest,
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = rag_pipeline.process_query(
        db=db,
        query=req.message,
        user_id=user.id if user else None,
        language_override=req.language if req.language in ["en", "hi", "mr"] else None
    )
    return result
