# Changelog

All notable changes to the **FinSaarthi AI** platform are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-29

### Added
- **Intelligent Scheme Discovery**: Multilingual semantic search powered by ChromaDB vector store and BGE-M3 cross-lingual embeddings.
- **Deterministic Rule Engine**: Authoritative Python rule evaluator for student, farmer, woman, income, age, and state criteria.
- **Explainable Eligibility Breakdown**: Step-by-step audit trail showing passed, failed, and missing document requirements for each welfare scheme.
- **Dynamic Citizen Profile**: Multi-attribute demographic profile builder supporting progressive completion and instant criteria updates.
- **Automated Document OCR & Mapping**: OCR extraction pipeline for Aadhaar, Caste Certificates, Income Certificates, and Student IDs with auto-mapping to citizen attributes.
- **Multilingual Support (EN, HI, MR)**: Seamless language localization covering English, Hindi, and Marathi across UI labels, scheme data, and conversational prompts.
- **Source-Grounded AI Assistant**: LangChain RAG pipeline backed by Google Gemini with strict anti-hallucination guardrails and verified portal citations.
- **Proactive Scheme Notifications**: Alert dispatching system matching citizen interests against newly published government welfare schemes.
- **Government Resource Registry**: Curated catalog of official state (MahaDBT) and central welfare portals.
- **Automated CI/CD**: GitHub Actions workflow running backend pytest test suite and frontend production build verification.

### Improved
- **Unified Navigation Interface**: Modern responsive dashboard with persona switcher (Citizen, Official, Admin, Developer).
- **Graceful Database Failover**: Automatic failover between PostgreSQL / Supabase and local SQLite database engine.
- **Offline Resilience**: Mock fallbacks for speech recognition and translation when external cloud endpoints are unreachable.
- **Prometheus Observability**: `/metrics` telemetry tracking request latency, eligibility evaluations, and RAG query volume.

### Fixed
- **Profile Validation**: Corrected demographic boundary checks for age and annual income thresholds.
- **Document Upload Handling**: Added mime-type validation and graceful error messaging for missing or unreadable document scans.
- **Secret Management**: Standardized `.env.example` templates and reinforced `.gitignore` protections.

---

## [0.5.0] - 2026-09-20

### Added
- Core FastAPI REST endpoints for scheme retrieval and citizen authentication.
- Initial Next.js 14 frontend skeleton with Tailwind CSS styling.
- Baseline 19 SQLAlchemy relational schema definitions.
- Local SQLite database migrations and seed data scripts.

---

## [0.1.0] - 2026-09-10

### Added
- Initial project architecture and technical approach blueprint.
- Basic scheme schema definitions and mock data prototypes.
