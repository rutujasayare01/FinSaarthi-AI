from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.all_models import User
from backend.schemas.all_schemas import EligibilityCheckResponse, BatchEligibilityResponse
from backend.services.eligibility_service import eligibility_service
from backend.api.auth import get_current_user

router = APIRouter(prefix="/eligibility", tags=["Eligibility & Rules Engine"])

@router.get("/check/{scheme_id}", response_model=EligibilityCheckResponse)
def check_single_scheme_eligibility(
    scheme_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        result = eligibility_service.evaluate_user_for_scheme(db, user_id=user.id, scheme_id=scheme_id, record_history=True)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/batch", response_model=BatchEligibilityResponse)
def evaluate_batch_eligibility(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = eligibility_service.evaluate_user_all_schemes(db, user_id=user.id)
    return results

@router.get("/summary")
def get_eligibility_summary(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = eligibility_service.evaluate_user_all_schemes(db, user_id=user.id)
    eligible = [r for r in results["results"] if r["status"] == "ELIGIBLE"]
    manual_review = [r for r in results["results"] if r["status"] == "MANUAL_REVIEW"]
    not_eligible = [r for r in results["results"] if r["status"] == "NOT_ELIGIBLE"]

    return {
        "user_id": user.id,
        "eligible_count": len(eligible),
        "manual_review_count": len(manual_review),
        "not_eligible_count": len(not_eligible),
        "eligible_schemes": eligible[:5],
        "manual_review_schemes": manual_review[:5]
    }

@router.post("/quick-check")
def quick_eligibility_check(
    profile_data: Dict[str, Any],
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Frictionless Citizen Direct Eligibility Evaluation & Cloud Profile Sync:
    1. Saves / updates profile in Supabase / PostgreSQL database.
    2. Immediately runs deterministic rule engine across all active schemes.
    3. Directly returns matching schemes with benefit summaries and application links.
    """
    from backend.models.all_models import UserProfile, Document

    # 1. Update user profile in database
    if user:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        if not profile:
            profile = UserProfile(user_id=user.id)
            db.add(profile)

        for key in [
            "age", "gender", "state", "district", "occupation", "annual_income",
            "category", "is_student", "is_farmer", "is_business", "has_disability",
            "education_level", "family_size", "marital_status"
        ]:
            if key in profile_data and profile_data[key] is not None:
                setattr(profile, key, profile_data[key])

        db.commit()
        db.refresh(profile)

        # Get any uploaded documents
        docs = db.query(Document).filter(
            Document.user_id == user.id,
            Document.status.in_(["UPLOADED", "EXTRACTED", "VERIFIED"])
        ).all()
        user_docs = [d.document_type for d in docs]
    else:
        user_docs = []

    # 2. Evaluate against all schemes
    all_evals = eligibility_service.evaluate_profile_dict(db, profile_data, user_documents=user_docs)
    eligible = [e for e in all_evals if e["status"] == "ELIGIBLE"]
    manual_review = [e for e in all_evals if e["status"] == "MANUAL_REVIEW"]
    not_eligible = [e for e in all_evals if e["status"] == "NOT_ELIGIBLE"]

    return {
        "saved": bool(user),
        "user_id": user.id if user else None,
        "total_schemes_evaluated": len(all_evals),
        "eligible_count": len(eligible),
        "manual_review_count": len(manual_review),
        "not_eligible_count": len(not_eligible),
        "eligible_schemes": eligible,
        "manual_review_schemes": manual_review,
        "not_eligible_schemes": not_eligible
    }

