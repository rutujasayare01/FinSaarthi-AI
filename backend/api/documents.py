from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.all_models import Document, DocumentExtraction, User
from backend.schemas.all_schemas import DocumentOut, DocumentUploadResponse
from backend.services.document_service import document_service
from backend.workers.celery_tasks import process_uploaded_document, dispatch_task
from backend.api.auth import get_current_user

router = APIRouter(prefix="/documents", tags=["Document Processing & OCR"])

@router.get("", response_model=List[Dict[str, Any]])
def list_documents(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.user_id == user.id).order_by(Document.created_at.desc()).all()
    out = []
    for d in docs:
        latest_ext = d.extractions[0] if d.extractions else None
        out.append({
            "id": d.id,
            "document_type": d.document_type,
            "file_name": d.file_name,
            "file_size": d.file_size,
            "mime_type": d.mime_type,
            "status": d.status,
            "created_at": d.created_at,
            "extracted_data": latest_ext.extracted_data if latest_ext else None,
            "confidence_score": latest_ext.confidence_score if latest_ext else None
        })
    return out

@router.post("/upload", response_model=Dict[str, Any])
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("INCOME_CERTIFICATE"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content = await file.read()
    file_path = document_service.save_file(user.id, file.filename, content)

    doc = Document(
        user_id=user.id,
        document_type=document_type.upper(),
        file_name=file.filename,
        file_path=file_path,
        file_size=len(content),
        mime_type=file.content_type or "application/pdf",
        status="UPLOADED"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Trigger OCR Extraction Pipeline
    extraction = document_service.process_ocr_and_extract(db, doc.id)

    # Also dispatch async task logging
    dispatch_task(process_uploaded_document, doc.id)

    return {
        "message": "Document uploaded and OCR structured data extracted successfully",
        "document_id": doc.id,
        "document_type": doc.document_type,
        "status": doc.status,
        "extracted_data": extraction.extracted_data,
        "confidence_score": extraction.confidence_score
    }

@router.delete("/{document_id}")
def delete_document(document_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}
