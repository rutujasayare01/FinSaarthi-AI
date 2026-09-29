import os
import logging
from typing import Optional, Any, Dict

logger = logging.getLogger("finsaarthi.supabase")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

_supabase_client = None

def get_supabase_client():
    """
    Returns an initialized Supabase Python client if credentials are configured.
    Falls back gracefully if Supabase environment variables are not yet provided.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.debug("Supabase URL or Key not set. Direct Supabase REST client will remain dormant.")
        return None

    try:
        from supabase import create_client, Client
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase client initialized successfully for URL: %s", SUPABASE_URL)
        return _supabase_client
    except Exception as e:
        logger.warning("Could not initialize Supabase client: %s", e)
        return None

def get_supabase_status() -> Dict[str, Any]:
    """
    Returns the current Supabase integration health status for observability.
    """
    client = get_supabase_client()
    return {
        "configured": bool(SUPABASE_URL and SUPABASE_KEY),
        "url": SUPABASE_URL if SUPABASE_URL else "NOT_CONFIGURED",
        "client_ready": client is not None,
        "mode": "CLOUD_SUPABASE" if (SUPABASE_URL and SUPABASE_KEY) else "HYBRID_POSTGRES_SQLITE"
    }
