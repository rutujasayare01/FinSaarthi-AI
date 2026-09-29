import pytest
from backend.database.connection import SessionLocal
from backend.models.all_models import User
from backend.ai.rag_pipeline import rag_pipeline

def test_rag_pipeline_marathi_query():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "citizen@finsaarthi.gov.in").first()
        query = "महाराष्ट्रातील विद्यार्थ्यांसाठी शिष्यवृत्ती दाखवा"

        res = rag_pipeline.process_query(db, query, user_id=user.id if user else None)
        assert res["detected_language"] == "mr"
        assert len(res["schemes_referenced"]) > 0
        assert "reply" in res
        assert len(res["reply"]) > 20
    finally:
        db.close()

def test_rag_pipeline_english_query():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "citizen@finsaarthi.gov.in").first()
        query = "Show me scholarships for Maharashtra students."

        res = rag_pipeline.process_query(db, query, user_id=user.id if user else None)
        assert res["detected_language"] == "en"
        assert len(res["schemes_referenced"]) > 0
        assert "reply" in res
    finally:
        db.close()
