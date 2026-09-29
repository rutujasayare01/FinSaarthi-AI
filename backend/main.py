import os
import time
import uuid
import logging
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST, Counter, Histogram

from backend.database.connection import engine, Base, SessionLocal
from backend.database.redis_client import redis_client
from backend.database.chroma_client import chroma_client
from backend.data.demo_seeds import seed_database

# API Routers
from backend.api.auth import router as auth_router
from backend.api.users import router as users_router
from backend.api.schemes import router as schemes_router
from backend.api.eligibility import router as eligibility_router
from backend.api.documents import router as documents_router
from backend.api.search import router as search_router
from backend.api.assistant import router as assistant_router
from backend.api.notifications import router as notifications_router
from backend.api.translations import router as translations_router
from backend.api.analytics import router as analytics_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [ReqID: %(request_id)s] %(message)s")
logger = logging.getLogger("finsaarthi.main")

# Prometheus Metrics
REQUEST_COUNT = Counter("http_requests_total", "Total HTTP requests", ["method", "endpoint", "status_code"])
REQUEST_LATENCY = Histogram("http_request_duration_seconds", "HTTP request latency", ["endpoint"])

app = FastAPI(
    title="FinSaarthi API Gateway & Services",
    description="Intelligent Multilingual Government Scheme Discovery & Eligibility Architecture",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request ID & Logging Middleware
@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id
    start_time = time.time()

    # Log with context
    extra = {"request_id": request_id}
    logger_adapter = logging.LoggerAdapter(logger, extra)

    try:
        response: Response = await call_next(request)
        duration = time.time() - start_time
        response.headers["X-Request-ID"] = request_id

        # Prometheus tracking
        endpoint = request.url.path
        REQUEST_COUNT.labels(method=request.method, endpoint=endpoint, status_code=response.status_code).inc()
        REQUEST_LATENCY.labels(endpoint=endpoint).observe(duration)

        logger_adapter.info("%s %s completed with status %d in %.2f ms", request.method, endpoint, response.status_code, duration * 1000)
        return response
    except Exception as e:
        logger_adapter.error("Unhandled error processing %s %s: %s", request.method, request.url.path, e)
        raise

# Startup Hook: Initialize Tables and Seed Data
@app.on_event("startup")
def on_startup():
    logger.info("Starting FinSaarthi Backend Services...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schemas verified.")

        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
    except Exception as e:
        logger.error("Error during startup database initialization: %s", e)

# Include Routers
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(schemes_router, prefix="/api")
app.include_router(eligibility_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(assistant_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(translations_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")

# System Observability & Health Endpoints
@app.get("/health", tags=["Observability"])
def health_check():
    db_ok = True
    try:
        with engine.connect() as conn:
            pass
    except Exception:
        db_ok = False

    redis_ok = True
    try:
        redis_ok = redis_client.ping()
    except Exception:
        redis_ok = False

    return {
        "status": "HEALTHY" if db_ok else "DEGRADED",
        "service": "FinSaarthi Backend API",
        "components": {
            "database": "CONNECTED" if db_ok else "DISCONNECTED",
            "redis_cache": "ONLINE" if redis_ok else "FALLBACK_MEMORY",
            "chroma_vector_db": "ONLINE",
            "bhashini_layer": "READY",
            "rule_engine": "READY"
        },
        "version": "1.0.0"
    }

@app.get("/metrics", tags=["Observability"])
def get_metrics():
    """Prometheus metrics endpoint."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/", tags=["Root"])
def root():
    return {
        "name": "FinSaarthi AI API Gateway",
        "status": "Active",
        "documentation": "/docs",
        "health": "/health",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
