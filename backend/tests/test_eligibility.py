import pytest
from backend.database.connection import SessionLocal
from backend.models.all_models import User, Scheme
from backend.services.eligibility_service import eligibility_service

def test_demo_citizen_eligibility():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "citizen@finsaarthi.gov.in").first()
        assert user is not None, "Demo Citizen must exist in database"

        # Ensure baseline attributes for test isolation
        user.profile.age = 21
        user.profile.state = "Maharashtra"
        user.profile.occupation = "Student"
        user.profile.annual_income = 240000.0
        user.profile.category = "OBC"
        user.profile.is_student = True
        user.profile.is_farmer = False
        user.profile.is_business = False
        db.commit()

        # 1. Scheme 1 (Rajarshi Chhatrapati Shahu Maharaj) -> ELIGIBLE
        s1 = db.query(Scheme).filter(Scheme.code == "MAHA-EBC-2024").first()
        assert s1 is not None
        res1 = eligibility_service.evaluate_user_for_scheme(db, user_id=user.id, scheme_id=s1.id, record_history=False)
        assert res1["status"] == "ELIGIBLE"

        # 2. Scheme 2 (Post Matric Scholarship to OBC) -> MANUAL_REVIEW because CASTE_CERTIFICATE is missing
        s2 = db.query(Scheme).filter(Scheme.code == "MAHA-OBC-PMSC").first()
        assert s2 is not None
        res2 = eligibility_service.evaluate_user_for_scheme(db, user_id=user.id, scheme_id=s2.id, record_history=False)
        assert res2["status"] == "MANUAL_REVIEW"
        assert "CASTE_CERTIFICATE" in res2["missing_documents"]

        # 3. Scheme 4 (PM-KISAN) -> NOT_ELIGIBLE because Demo Citizen is not a farmer
        s4 = db.query(Scheme).filter(Scheme.code == "CENTRAL-PM-KISAN").first()
        assert s4 is not None
        res4 = eligibility_service.evaluate_user_for_scheme(db, user_id=user.id, scheme_id=s4.id, record_history=False)
        assert res4["status"] == "NOT_ELIGIBLE"

    finally:
        db.close()
