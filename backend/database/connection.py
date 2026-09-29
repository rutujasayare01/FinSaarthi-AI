import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger("finsaarthi.database")

# Check for Supabase or general PostgreSQL database URLs
RAW_DATABASE_URL = (
    os.getenv("SUPABASE_DATABASE_URL")
    or os.getenv("SUPABASE_DB_URL")
    or os.getenv("DATABASE_URL")
    or "postgresql://postgres:postgres@localhost:5432/finsaarthi"
)

# SQLAlchemy requires 'postgresql://' instead of legacy 'postgres://'
if RAW_DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = RAW_DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    DATABASE_URL = RAW_DATABASE_URL

SQLITE_FALLBACK_URL = os.getenv("SQLITE_FALLBACK_URL", "sqlite:///./finsaarthi.db")

Base = declarative_base()

def get_engine():
    """
    Creates an engine, attempting PostgreSQL / Supabase first if configured.
    Falls back to SQLite if PostgreSQL cannot connect or if configured.
    """
    url = DATABASE_URL
    is_supabase = "supabase.co" in url or "pooler.supabase.com" in url

    try:
        if "postgresql" in url:
            connect_args = {"connect_timeout": 5}
            # For Supabase or remote PostgreSQL, ensure SSL if specified
            if is_supabase and "sslmode" not in url:
                url = url + ("&" if "?" in url else "?") + "sslmode=require"

            test_engine = create_engine(
                url,
                connect_args=connect_args,
                pool_pre_ping=True,
                pool_recycle=300
            )
            with test_engine.connect():
                target_desc = "Supabase PostgreSQL Database" if is_supabase else "PostgreSQL database"
                logger.info("Connected successfully to %s at %s", target_desc, url.split('@')[-1].split('?')[0])
                return test_engine
    except Exception as e:
        target_name = "Supabase / PostgreSQL" if is_supabase else "PostgreSQL"
        logger.warning("%s connection unavailable (%s). Falling back to SQLite local database.", target_name, e)
        url = SQLITE_FALLBACK_URL

    if "sqlite" in url:
        return create_engine(url, connect_args={"check_same_thread": False})
    return create_engine(url, pool_pre_ping=True)

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
