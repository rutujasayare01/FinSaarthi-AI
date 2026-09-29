import os
import json
import logging
from datetime import datetime
from sqlalchemy.orm import Session

from backend.models.all_models import (
    User, UserProfile, Document, DocumentExtraction, Scheme, SchemeRule, SchemeDocument,
    Notification, NotificationPreference, UserInterest
)
from backend.services.scheme_service import scheme_service
from backend.api.auth import hash_password

logger = logging.getLogger("finsaarthi.seeds")

def seed_database(db: Session):
    """
    Populates database with the preconfigured Hackathon Demo Scenario (Section 29)
    and initial government schemes with ChromaDB vector embeddings.
    """
    logger.info("Starting database seeding...")

    # 1. Seed Roles & Users
    users_data = [
        {
            "email": "citizen@finsaarthi.gov.in",
            "full_name": "Demo Citizen",
            "role": "CITIZEN",
            "phone": "+91 98765 43210",
            "profile": {
                "age": 21,
                "gender": "Male",
                "state": "Maharashtra",
                "district": "Pune",
                "occupation": "Student",
                "annual_income": 240000.0,
                "category": "OBC",
                "is_student": True,
                "is_farmer": False,
                "is_business": False,
                "has_disability": False,
                "education_level": "Diploma in Computer Technology",
                "family_size": 4,
                "marital_status": "Single"
            }
        },
        {
            "email": "official@finsaarthi.gov.in",
            "full_name": "Rajesh Deshmukh (District Social Welfare Officer)",
            "role": "OFFICIAL",
            "phone": "+91 98220 12345",
            "profile": {
                "age": 42,
                "gender": "Male",
                "state": "Maharashtra",
                "district": "Pune",
                "occupation": "Government Official",
                "annual_income": 950000.0,
                "category": "General",
                "is_student": False,
                "is_farmer": False,
                "is_business": False,
                "has_disability": False
            }
        },
        {
            "email": "admin@finsaarthi.gov.in",
            "full_name": "FinSaarthi System Admin",
            "role": "ADMIN",
            "phone": "+91 98000 00001",
            "profile": {
                "state": "Maharashtra",
                "annual_income": 1200000.0
            }
        },
        {
            "email": "dev@finsaarthi.gov.in",
            "full_name": "Platform Integrator Developer",
            "role": "DEVELOPER",
            "phone": "+91 98000 00002",
            "profile": {
                "state": "All India",
                "annual_income": 1400000.0
            }
        }
    ]

    citizen_user = None

    for u_info in users_data:
        existing = db.query(User).filter(User.email == u_info["email"]).first()
        if not existing:
            u = User(
                email=u_info["email"],
                password_hash=hash_password("Password@123"),
                full_name=u_info["full_name"],
                role=u_info["role"],
                phone=u_info["phone"],
                is_active=True
            )
            db.add(u)
            db.commit()
            db.refresh(u)

            # Profile
            p_data = u_info["profile"]
            prof = UserProfile(user_id=u.id, **p_data)
            db.add(prof)

            # Notification preferences
            notif_pref = NotificationPreference(user_id=u.id, frequency="INSTANT", email_enabled=True, push_enabled=True, in_app_enabled=True)
            db.add(notif_pref)
            db.commit()

            if u.role == "CITIZEN":
                citizen_user = u
        else:
            if existing.role == "CITIZEN":
                citizen_user = existing

    # 2. Seed Demo Documents for Demo Citizen
    if citizen_user:
        # Check if citizen documents already exist
        doc_count = db.query(Document).filter(Document.user_id == citizen_user.id).count()
        if doc_count == 0:
            # Document 1: Income Certificate
            doc1 = Document(
                user_id=citizen_user.id,
                document_type="INCOME_CERTIFICATE",
                file_name="Income_Certificate_2024.pdf",
                file_path="./data/uploads/demo_income_cert.pdf",
                file_size=245000,
                mime_type="application/pdf",
                status="EXTRACTED"
            )
            db.add(doc1)
            db.commit()
            db.refresh(doc1)

            ext1 = DocumentExtraction(
                document_id=doc1.id,
                raw_text="GOVERNMENT OF MAHARASHTRA\nINCOME CERTIFICATE\nAnnual Income: Rs 2,40,000",
                extracted_data={
                    "annual_income": 240000.0,
                    "financial_year": "2024-2025",
                    "applicant_name": "Demo Citizen",
                    "certificate_number": "MAH/REV/INC/2024/88921"
                },
                confidence_score=0.98,
                verified_fields={"annual_income": 240000.0},
                ocr_engine="Tesseract OCR"
            )
            db.add(ext1)

            # Document 2: Student ID
            doc2 = Document(
                user_id=citizen_user.id,
                document_type="STUDENT_ID",
                file_name="Polytechnic_Student_ID.pdf",
                file_path="./data/uploads/demo_student_id.pdf",
                file_size=180000,
                mime_type="application/pdf",
                status="EXTRACTED"
            )
            db.add(doc2)
            db.commit()
            db.refresh(doc2)

            ext2 = DocumentExtraction(
                document_id=doc2.id,
                raw_text="GOVERNMENT POLYTECHNIC PUNE\nSTUDENT ID: GP/DIP/COMP/2024-78\nEnrolled Diploma Student",
                extracted_data={
                    "institution_name": "Government Polytechnic Pune",
                    "roll_number": "GP/DIP/COMP/2024-78",
                    "course": "Diploma in Computer Technology",
                    "status": "Regular Full-Time Student"
                },
                confidence_score=0.97,
                verified_fields={"is_student": True},
                ocr_engine="Tesseract OCR"
            )
            db.add(ext2)

            # Initial search interests
            db.add(UserInterest(user_id=citizen_user.id, tag="Education", source="SEARCH", weight=2.5))
            db.add(UserInterest(user_id=citizen_user.id, tag="Maharashtra", source="SEARCH", weight=2.0))

            # Initial smart notification
            db.add(Notification(
                user_id=citizen_user.id,
                title="Welcome to FinSaarthi AI",
                message="Your profile has been created. Check matched state and central schemes based on your student status.",
                type="NEW_SCHEME",
                channel="IN_APP",
                is_read=False,
                action_url="/schemes",
                created_at=datetime.utcnow()
            ))

            db.commit()

    # 3. Seed Schemes from schemes.json
    schemes_file = os.path.join(os.path.dirname(__file__), "schemes.json")
    if os.path.exists(schemes_file):
        with open(schemes_file, "r", encoding="utf-8") as f:
            schemes_list = json.load(f)

        for s_data in schemes_list:
            existing_scheme = scheme_service.get_by_code(db, s_data["code"])
            if not existing_scheme:
                scheme_service.create_scheme(db, s_data, trigger_discovery=False)
                logger.info("Seeded scheme: %s (%s)", s_data["title"], s_data["code"])

    logger.info("Database seeding completed successfully.")
