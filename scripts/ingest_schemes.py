#!/usr/bin/env python3
"""
Data Ingestion Pipeline for FinSaarthi Schemes
Supports: CSV, JSON, PDF datasets
Usage:
    python scripts/ingest_schemes.py backend/data/schemes.csv
    python scripts/ingest_schemes.py backend/data/schemes.json
"""

import sys
import os
import csv
import json
import logging

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database.connection import SessionLocal, Base, engine
from backend.services.scheme_service import scheme_service
from backend.rules.business_rules import BusinessRuleBuilder

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ingest_schemes")

def parse_csv(file_path: str):
    schemes = []
    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            is_active = str(row.get("is_active", "true")).lower() == "true"
            is_demo = str(row.get("is_demo", "false")).lower() == "true"

            # Auto-generate baseline rules if CSV does not define nested rules
            rules = []
            state_val = row.get("state", "All India")
            if state_val and state_val.lower() != "all india":
                rules.append(BusinessRuleBuilder.state_residence_rule(state_val))

            category = row.get("category", "")
            if category.lower() == "education":
                rules.append(BusinessRuleBuilder.student_status_rule())
                rules.append(BusinessRuleBuilder.income_limit_rule(800000.0))
            elif category.lower() == "agriculture":
                rules.append(BusinessRuleBuilder.farmer_status_rule())
            elif category.lower() == "business":
                rules.append(BusinessRuleBuilder.business_status_rule())

            schemes.append({
                "code": row["code"].strip(),
                "title": row["title"].strip(),
                "title_hi": row.get("title_hi"),
                "title_mr": row.get("title_mr"),
                "ministry": row["ministry"].strip(),
                "department": row.get("department"),
                "state": state_val.strip(),
                "category": category.strip(),
                "target_audience": row.get("target_audience", "Citizens").strip(),
                "description": row["description"].strip(),
                "benefits_summary": row["benefits_summary"].strip(),
                "application_url": row.get("application_url"),
                "deadline": row.get("deadline"),
                "is_active": is_active,
                "is_demo": is_demo,
                "rules": rules,
                "required_documents": [
                    {"document_type": "INCOME_CERTIFICATE", "is_mandatory": True},
                    {"document_type": "STUDENT_ID" if category.lower() == "education" else "AADHAAR", "is_mandatory": True}
                ]
            })
    return schemes

def parse_json(file_path: str):
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def ingest_dataset(file_path: str):
    if not os.path.exists(file_path):
        logger.error("File does not exist: %s", file_path)
        sys.exit(1)

    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    ext = os.path.splitext(file_path)[1].lower()
    logger.info("Parsing file format: %s...", ext)

    if ext == ".csv":
        schemes = parse_csv(file_path)
    elif ext == ".json":
        schemes = parse_json(file_path)
    else:
        logger.error("Unsupported file extension '%s'. Supported formats: .csv, .json", ext)
        sys.exit(1)

    logger.info("Validating and ingesting %d schemes...", len(schemes))
    db = SessionLocal()
    success_count = 0

    try:
        for s in schemes:
            code = s.get("code")
            existing = scheme_service.get_by_code(db, code)
            if existing:
                logger.info("Scheme '%s' already exists in database. Updating vector index...", code)
                scheme_service.index_scheme_in_chroma(existing)
            else:
                new_s = scheme_service.create_scheme(db, s, trigger_discovery=True)
                logger.info("Ingested and indexed scheme: %s (%s)", new_s.title, new_s.code)
            success_count += 1

        logger.info("Data Ingestion Pipeline Complete! Ingested %d schemes into PostgreSQL & ChromaDB.", success_count)
    finally:
        db.close()

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "backend/data/schemes.csv"
    ingest_dataset(target)
