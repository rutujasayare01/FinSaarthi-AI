from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# User & Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    role: str = "CITIZEN"
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# User Profile
class UserProfileBase(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = "All"
    state: str = "Maharashtra"
    district: Optional[str] = None
    occupation: Optional[str] = "Student"
    annual_income: float = 0.0
    category: str = "General"
    is_student: bool = False
    is_farmer: bool = False
    is_business: bool = False
    has_disability: bool = False
    education_level: Optional[str] = None
    family_size: int = 4
    marital_status: str = "Single"

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfileOut(UserProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Scheme Documents & Rules
class SchemeDocumentOut(BaseModel):
    id: int
    document_type: str
    is_mandatory: bool
    description: Optional[str] = None

    class Config:
        from_attributes = True

class SchemeRuleOut(BaseModel):
    id: int
    rule_name: str
    field: str
    operator: str
    value: Any
    is_required: bool
    failure_reason: Optional[str] = None

    class Config:
        from_attributes = True

class SchemeBase(BaseModel):
    code: str
    title: str
    title_hi: Optional[str] = None
    title_mr: Optional[str] = None
    ministry: str
    department: Optional[str] = None
    state: str = "All India"
    category: str = "Education"
    target_audience: str = "Citizens"
    description: str
    description_hi: Optional[str] = None
    description_mr: Optional[str] = None
    benefits_summary: str
    application_url: Optional[str] = None
    deadline: Optional[str] = None
    is_active: bool = True
    is_demo: bool = False

class SchemeCreate(SchemeBase):
    rules: Optional[List[Dict[str, Any]]] = []
    required_documents: Optional[List[Dict[str, Any]]] = []

class SchemeOut(SchemeBase):
    id: int
    created_at: datetime
    rules: Optional[List[SchemeRuleOut]] = []
    required_documents: Optional[List[SchemeDocumentOut]] = []

    class Config:
        from_attributes = True

# Eligibility Evaluation Schemas
class RuleEvaluationDetail(BaseModel):
    field: str
    operator: str
    expected_value: Any
    actual_value: Any
    passed: bool
    reason: Optional[str] = None

class EligibilityCheckResponse(BaseModel):
    scheme_id: int
    scheme_title: str
    scheme_code: Optional[str] = None
    ministry: Optional[str] = None
    category: Optional[str] = None
    state: Optional[str] = None
    benefits_summary: Optional[str] = None
    application_url: Optional[str] = None
    status: str  # ELIGIBLE, NOT_ELIGIBLE, MANUAL_REVIEW
    confidence: str  # HIGH, MEDIUM, LOW
    passed_rules: List[RuleEvaluationDetail] = []
    failed_rules: List[RuleEvaluationDetail] = []
    missing_information: List[str] = []
    missing_documents: List[str] = []
    summary: str
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)

class BatchEligibilityResponse(BaseModel):
    user_id: int
    total_schemes_evaluated: int
    eligible_count: int
    manual_review_count: int
    not_eligible_count: int
    results: List[EligibilityCheckResponse]

# Document Schemas
class DocumentExtractionOut(BaseModel):
    id: int
    raw_text: Optional[str] = None
    extracted_data: Dict[str, Any] = {}
    confidence_score: float
    verified_fields: Dict[str, Any] = {}
    ocr_engine: str

    class Config:
        from_attributes = True

class DocumentOut(BaseModel):
    id: int
    user_id: int
    document_type: str
    file_name: str
    file_size: int
    mime_type: str
    status: str
    created_at: datetime
    extractions: List[DocumentExtractionOut] = []

    class Config:
        from_attributes = True

class DocumentUploadResponse(BaseModel):
    message: str
    document: DocumentOut
    extracted_data: Optional[Dict[str, Any]] = None

# Search Schemas
class SearchQueryRequest(BaseModel):
    query: str
    language: str = "en"  # en, hi, mr
    state: Optional[str] = None
    category: Optional[str] = None
    top_k: int = 10

class SchemeSearchResult(BaseModel):
    scheme: SchemeOut
    relevance_score: float
    eligibility_status: Optional[str] = None
    snippet: Optional[str] = None

class SearchResponse(BaseModel):
    query: str
    detected_language: str
    translated_query: Optional[str] = None
    total_results: int
    results: List[SchemeSearchResult]

# Assistant / RAG Schemas
class SourceCitation(BaseModel):
    scheme_id: int
    title: str
    ministry: str
    official_url: Optional[str] = None

class AssistantMessageRequest(BaseModel):
    message: str
    language: str = "en"  # en, hi, mr
    session_id: Optional[str] = None

class AssistantMessageResponse(BaseModel):
    reply: str
    detected_language: str
    schemes_referenced: List[SourceCitation] = []
    eligibility_summary: Optional[Dict[str, Any]] = None
    suggested_actions: List[str] = []

# Notifications
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    channel: str
    is_read: bool
    action_url: Optional[str] = None
    metadata_json: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationPreferenceOut(BaseModel):
    frequency: str
    email_enabled: bool
    push_enabled: bool
    in_app_enabled: bool

    class Config:
        from_attributes = True

class NotificationPreferenceUpdate(BaseModel):
    frequency: Optional[str] = None
    email_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None
    in_app_enabled: Optional[bool] = None

# Bhashini / Translation / Speech
class TranslateRequest(BaseModel):
    text: str
    source_language: str  # en, hi, mr
    target_language: str  # en, hi, mr

class TranslateResponse(BaseModel):
    source_language: str
    target_language: str
    original_text: str
    translated_text: str
    provider: str

class TranscribeResponse(BaseModel):
    text: str
    detected_language: str
    confidence: float
    provider: str

class TTSRequest(BaseModel):
    text: str
    language: str = "en"

class TTSResponse(BaseModel):
    audio_base64: str
    language: str
    provider: str
