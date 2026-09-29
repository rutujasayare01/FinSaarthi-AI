from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.all_models import Scheme, SchemeRule, SchemeDocument, User
from backend.schemas.all_schemas import SchemeOut, SchemeCreate
from backend.services.scheme_service import scheme_service
from backend.api.auth import get_current_user, require_role

router = APIRouter(prefix="/schemes", tags=["Schemes Directory"])

@router.get("", response_model=List[Dict[str, Any]])
def list_schemes(
    category: Optional[str] = None,
    state: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    schemes = scheme_service.get_all(db, skip=skip, limit=limit, category=category, state=state)
    output = []
    for s in schemes:
        output.append({
            "id": s.id,
            "code": s.code,
            "title": s.title,
            "title_hi": s.title_hi,
            "title_mr": s.title_mr,
            "ministry": s.ministry,
            "department": s.department,
            "state": s.state,
            "category": s.category,
            "target_audience": s.target_audience,
            "description": s.description,
            "description_hi": s.description_hi,
            "description_mr": s.description_mr,
            "benefits_summary": s.benefits_summary,
            "application_url": s.application_url,
            "deadline": s.deadline,
            "is_active": s.is_active,
            "is_demo": s.is_demo,
            "rules_count": len(s.rules),
            "documents_count": len(s.required_documents)
        })
    return output

@router.get("/{scheme_id}", response_model=Dict[str, Any])
def get_scheme_detail(scheme_id: int, db: Session = Depends(get_db)):
    scheme = scheme_service.get_by_id(db, scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    return {
        "id": scheme.id,
        "code": scheme.code,
        "title": scheme.title,
        "title_hi": scheme.title_hi,
        "title_mr": scheme.title_mr,
        "ministry": scheme.ministry,
        "department": scheme.department,
        "state": scheme.state,
        "category": scheme.category,
        "target_audience": scheme.target_audience,
        "description": scheme.description,
        "description_hi": scheme.description_hi,
        "description_mr": scheme.description_mr,
        "benefits_summary": scheme.benefits_summary,
        "application_url": scheme.application_url,
        "deadline": scheme.deadline,
        "is_active": scheme.is_active,
        "is_demo": scheme.is_demo,
        "rules": [
            {
                "id": r.id,
                "rule_name": r.rule_name,
                "field": r.field,
                "operator": r.operator,
                "value": r.value,
                "is_required": r.is_required,
                "failure_reason": r.failure_reason
            }
            for r in scheme.rules
        ],
        "required_documents": [
            {
                "id": d.id,
                "document_type": d.document_type,
                "is_mandatory": d.is_mandatory,
                "description": d.description
            }
            for d in scheme.required_documents
        ]
    }

@router.post("", response_model=Dict[str, Any])
def create_scheme(
    scheme_in: SchemeCreate,
    current_user: User = Depends(require_role(["ADMIN", "OFFICIAL"])),
    db: Session = Depends(get_db)
):
    existing = scheme_service.get_by_code(db, scheme_in.code)
    if existing:
        raise HTTPException(status_code=400, detail=f"Scheme with code '{scheme_in.code}' already exists")

    scheme = scheme_service.create_scheme(db, scheme_in.dict())
    return {"message": "Scheme created and indexed successfully", "scheme_id": scheme.id, "code": scheme.code}
