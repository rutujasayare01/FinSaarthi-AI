import os
import hashlib
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models.all_models import User, UserProfile
from backend.schemas.all_schemas import UserCreate, UserLogin, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication & Security"])

SECRET_KEY = os.getenv("JWT_SECRET", "finsaarthi-production-grade-jwt-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)

def hash_password(password: str) -> str:
    """Hashes password securely with sha256 + salt."""
    salt = "finsaarthi_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        # Default fallback to Demo Citizen if unauthenticated in local demo
        demo_user = db.query(User).filter(User.email == "citizen@finsaarthi.gov.in").first()
        return demo_user

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")

def require_role(roles: List[str]):
    def role_checker(current_user: Optional[User] = Depends(get_current_user)):
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
        if current_user.role not in roles and current_user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Required role '{roles}', current role '{current_user.role}'"
            )
        return current_user
    return role_checker

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role.upper(),
        phone=user_in.phone
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create default profile
    profile = UserProfile(
        user_id=user.id,
        state="Maharashtra",
        occupation="Student" if user.role == "CITIZEN" else "Official",
        annual_income=240000.0 if user.role == "CITIZEN" else 500000.0
    )
    db.add(profile)
    db.commit()

    token = create_access_token({"user_id": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}
    }

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    token = create_access_token({"user_id": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}
    }

@router.post("/token", response_model=TokenResponse)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 compatible token endpoint"""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    token = create_access_token({"user_id": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}
    }

@router.post("/demo-login/{role}", response_model=TokenResponse)
def demo_quick_login(role: str, db: Session = Depends(get_db)):
    """
    Instant role switch for hackathon evaluation:
    Roles: CITIZEN, OFFICIAL, ADMIN, DEVELOPER
    """
    clean_role = role.upper()
    role_email_map = {
        "CITIZEN": "citizen@finsaarthi.gov.in",
        "OFFICIAL": "official@finsaarthi.gov.in",
        "ADMIN": "admin@finsaarthi.gov.in",
        "DEVELOPER": "dev@finsaarthi.gov.in"
    }

    target_email = role_email_map.get(clean_role, "citizen@finsaarthi.gov.in")
    user = db.query(User).filter(User.email == target_email).first()

    if not user:
        # Create demo user on demand if not yet seeded
        from backend.data.demo_seeds import seed_database
        seed_database(db)
        user = db.query(User).filter(User.email == target_email).first()

    token = create_access_token({"user_id": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}
    }

@router.get("/me", response_model=Dict[str, Any])
def get_current_user_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "phone": user.phone,
        "profile": profile.__dict__ if profile else None
    }

@router.get("/oauth/providers")
def get_oauth_providers():
    """OAuth 2.0 integration architecture metadata."""
    return {
        "providers": [
            {"id": "digilocker", "name": "DigiLocker India", "type": "Government Identity OAuth 2.0", "status": "READY"},
            {"id": "google", "name": "Google OAuth 2.0", "type": "Social Identity", "status": "READY"},
            {"id": "parichay", "name": "Jan Parichay (ePramaan)", "type": "National Single Sign-On", "status": "READY"}
        ]
    }
