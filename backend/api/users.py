from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.all_models import User, UserProfile, SavedScheme, Scheme
from backend.schemas.all_schemas import UserProfileUpdate, UserProfileOut
from backend.api.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users & Profiles"])

@router.get("/profile", response_model=Dict[str, Any])
def get_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        profile = UserProfile(user_id=user.id, state="Maharashtra", annual_income=240000.0)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return {
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "phone": user.phone,
        "profile": {
            "age": profile.age,
            "gender": profile.gender,
            "state": profile.state,
            "district": profile.district,
            "occupation": profile.occupation,
            "annual_income": profile.annual_income,
            "category": profile.category,
            "is_student": profile.is_student,
            "is_farmer": profile.is_farmer,
            "is_business": profile.is_business,
            "has_disability": profile.has_disability,
            "education_level": profile.education_level,
            "family_size": profile.family_size,
            "marital_status": profile.marital_status
        }
    }

@router.put("/profile", response_model=Dict[str, Any])
def update_profile(data: UserProfileUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        profile = UserProfile(user_id=user.id)
        db.add(profile)

    for field, value in data.dict(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return {"message": "Profile updated successfully", "profile": profile.__dict__}

@router.get("/saved-schemes")
def get_saved_schemes(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    saved = db.query(SavedScheme).filter(SavedScheme.user_id == user.id).all()
    res = []
    for item in saved:
        res.append({
            "saved_id": item.id,
            "saved_at": item.saved_at,
            "scheme": {
                "id": item.scheme.id,
                "code": item.scheme.code,
                "title": item.scheme.title,
                "ministry": item.scheme.ministry,
                "category": item.scheme.category,
                "state": item.scheme.state,
                "benefits_summary": item.scheme.benefits_summary,
                "application_url": item.scheme.application_url
            }
        })
    return res

@router.post("/saved-schemes/{scheme_id}")
def save_scheme(scheme_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(SavedScheme).filter(SavedScheme.user_id == user.id, SavedScheme.scheme_id == scheme_id).first()
    if existing:
        return {"message": "Scheme already saved"}

    saved = SavedScheme(user_id=user.id, scheme_id=scheme_id)
    db.add(saved)
    db.commit()
    return {"message": "Scheme saved to bookmarks"}

@router.delete("/saved-schemes/{scheme_id}")
def unsave_scheme(scheme_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    saved = db.query(SavedScheme).filter(SavedScheme.user_id == user.id, SavedScheme.scheme_id == scheme_id).first()
    if saved:
        db.delete(saved)
        db.commit()
    return {"message": "Scheme removed from bookmarks"}
