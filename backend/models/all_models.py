from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from backend.database.connection import Base

# 1. Users
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="CITIZEN", nullable=False)  # CITIZEN, OFFICIAL, ADMIN, DEVELOPER
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    eligibility_checks = relationship("EligibilityCheck", back_populates="user", cascade="all, delete-orphan")
    saved_schemes = relationship("SavedScheme", back_populates="user", cascade="all, delete-orphan")
    search_history = relationship("SearchHistory", back_populates="user", cascade="all, delete-orphan")
    user_interests = relationship("UserInterest", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    notification_preferences = relationship("NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")


# 2. User Profiles
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)  # Male, Female, Other, All
    state = Column(String(100), default="Maharashtra", nullable=False)
    district = Column(String(100), nullable=True)
    occupation = Column(String(100), nullable=True)  # Student, Farmer, Entrepreneur, Unemployed, etc.
    annual_income = Column(Float, default=0.0, nullable=False)
    category = Column(String(50), default="General", nullable=False)  # General, OBC, SC, ST, EWS, Minority
    is_student = Column(Boolean, default=False)
    is_farmer = Column(Boolean, default=False)
    is_business = Column(Boolean, default=False)
    has_disability = Column(Boolean, default=False)
    education_level = Column(String(100), nullable=True)  # 10th, 12th, Diploma, Graduate, Post-Graduate
    family_size = Column(Integer, default=4)
    marital_status = Column(String(50), default="Single")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


# 3. Documents
class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(100), nullable=False)  # INCOME_CERTIFICATE, STUDENT_ID, CASTE_CERTIFICATE, AADHAAR, etc.
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0)
    mime_type = Column(String(100), default="application/pdf")
    status = Column(String(50), default="UPLOADED")  # UPLOADED, PROCESSING, EXTRACTED, VERIFIED, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="documents")
    extractions = relationship("DocumentExtraction", back_populates="document", cascade="all, delete-orphan")


# 4. Document Extractions (OCR / Metadata parsed)
class DocumentExtraction(Base):
    __tablename__ = "document_extractions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    raw_text = Column(Text, nullable=True)
    extracted_data = Column(JSON, default=dict)  # structured fields: income, roll_no, name, cert_no, etc.
    confidence_score = Column(Float, default=0.9)
    verified_fields = Column(JSON, default=dict)
    ocr_engine = Column(String(50), default="Tesseract / EasyOCR Mock")
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="extractions")


# 5. Schemes
class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False, index=True)
    title_hi = Column(String(255), nullable=True)
    title_mr = Column(String(255), nullable=True)
    ministry = Column(String(255), nullable=False)
    department = Column(String(255), nullable=True)
    state = Column(String(100), default="All India", nullable=False)  # All India, Maharashtra, etc.
    category = Column(String(100), default="Education", nullable=False)  # Education, Agriculture, Business, Social Welfare
    target_audience = Column(String(255), default="Citizens")
    description = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=True)
    description_mr = Column(Text, nullable=True)
    benefits_summary = Column(Text, nullable=False)
    application_url = Column(String(500), nullable=True)
    deadline = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    rules = relationship("SchemeRule", back_populates="scheme", cascade="all, delete-orphan")
    required_documents = relationship("SchemeDocument", back_populates="scheme", cascade="all, delete-orphan")
    updates = relationship("SchemeUpdate", back_populates="scheme", cascade="all, delete-orphan")


# 6. Scheme Rules
class SchemeRule(Base):
    __tablename__ = "scheme_rules"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    rule_name = Column(String(100), nullable=False)
    field = Column(String(100), nullable=False)  # annual_income, age, state, category, is_student, etc.
    operator = Column(String(20), nullable=False)  # ==, !=, >, >=, <, <=, IN, NOT_IN
    value = Column(JSON, nullable=False)  # stored as JSON for polymorphic types (int, string, list)
    is_required = Column(Boolean, default=True)
    failure_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    scheme = relationship("Scheme", back_populates="rules")


# 7. Scheme Documents
class SchemeDocument(Base):
    __tablename__ = "scheme_documents"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(100), nullable=False)  # INCOME_CERTIFICATE, STUDENT_ID, etc.
    is_mandatory = Column(Boolean, default=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    scheme = relationship("Scheme", back_populates="required_documents")


# 8. Scheme Updates
class SchemeUpdate(Base):
    __tablename__ = "scheme_updates"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    version = Column(String(20), default="1.0.0")
    change_summary = Column(Text, nullable=False)
    updated_by = Column(String(100), default="System")
    created_at = Column(DateTime, default=datetime.utcnow)

    scheme = relationship("Scheme", back_populates="updates")


# 9. Eligibility Checks
class EligibilityCheck(Base):
    __tablename__ = "eligibility_checks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False)  # ELIGIBLE, NOT_ELIGIBLE, MANUAL_REVIEW
    confidence = Column(String(20), default="HIGH")  # HIGH, MEDIUM, LOW
    evaluated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="eligibility_checks")
    scheme = relationship("Scheme")
    results = relationship("EligibilityResult", back_populates="check", cascade="all, delete-orphan")


# 10. Eligibility Results
class EligibilityResult(Base):
    __tablename__ = "eligibility_results"

    id = Column(Integer, primary_key=True, index=True)
    check_id = Column(Integer, ForeignKey("eligibility_checks.id", ondelete="CASCADE"), nullable=False)
    rule_id = Column(Integer, ForeignKey("scheme_rules.id", ondelete="SET NULL"), nullable=True)
    field = Column(String(100), nullable=False)
    operator = Column(String(20), nullable=False)
    expected_value = Column(JSON, nullable=True)
    actual_value = Column(JSON, nullable=True)
    passed = Column(Boolean, default=False)
    reason = Column(String(255), nullable=True)

    check = relationship("EligibilityCheck", back_populates="results")


# 11. Search History
class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    query_text = Column(String(500), nullable=False)
    language = Column(String(20), default="en")
    result_count = Column(Integer, default=0)
    searched_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="search_history")


# 12. User Interests
class UserInterest(Base):
    __tablename__ = "user_interests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tag = Column(String(100), nullable=False, index=True)
    source = Column(String(50), default="SEARCH")  # SEARCH, EXPLICIT, SAVED
    weight = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="user_interests")


# 13. Saved Schemes
class SavedScheme(Base):
    __tablename__ = "saved_schemes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    notes = Column(Text, nullable=True)
    saved_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_schemes")
    scheme = relationship("Scheme")


# 14. Notifications
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # NEW_SCHEME, SCHEME_UPDATED, DEADLINE_APPROACHING, etc.
    channel = Column(String(50), default="IN_APP")  # IN_APP, PUSH, EMAIL
    is_read = Column(Boolean, default=False)
    action_url = Column(String(500), nullable=True)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


# 15. Notification Preferences
class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    frequency = Column(String(50), default="INSTANT")  # INSTANT, DAILY_DIGEST, WEEKLY_DIGEST, OFF
    email_enabled = Column(Boolean, default=True)
    push_enabled = Column(Boolean, default=True)
    in_app_enabled = Column(Boolean, default=True)

    user = relationship("User", back_populates="notification_preferences")


# 16. Applications
class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    application_number = Column(String(100), unique=True, index=True, nullable=False)
    status = Column(String(50), default="SUBMITTED")  # DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
    tracking_url = Column(String(500), nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="applications")
    scheme = relationship("Scheme")


# 17. Audit Logs
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=False)
    details_json = Column(JSON, default=dict)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# 18. Admin Users
class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    department = Column(String(100), default="Department of Social Justice and Empowerment")
    permissions_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


# 19. Analytics Events
class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    session_id = Column(String(100), nullable=True)
    properties_json = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)
