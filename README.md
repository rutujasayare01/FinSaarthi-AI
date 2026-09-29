# FinSaarthi AI (फिनसारथी)

> **Intelligent Multilingual Government Scheme Discovery, Deterministic Eligibility & AI Assistance Platform**

[![FinSaarthi CI](https://github.com/rutujasayare01/FinSaarthi-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/rutujasayare01/FinSaarthi-AI/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-v1.0.0-blue.svg)](https://github.com/rutujasayare01/FinSaarthi-AI/releases/tag/v1.0.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB.svg)](https://python.org)

---

## 📌 Overview

**FinSaarthi AI** is an intelligent public digital infrastructure solution engineered to bridge the accessibility gap between Indian citizens and government welfare schemes. By uniting **mathematically authoritative deterministic rule evaluation** with **cross-lingual semantic search (BGE-M3 + ChromaDB)**, **multilingual speech and translation (Government of India BHASHINI)**, and **source-grounded AI assistance (Google Gemini + LangChain)**, FinSaarthi guarantees that welfare entitlements reach students, farmers, women, and entrepreneurs without bureaucratic opacity or AI hallucinations.

---

## 🎯 Problem Statement

India offers hundreds of Central and State welfare initiatives, yet millions of eligible citizens miss out on life-changing benefits due to:
1. **Information Asymmetry**: Complex government gazettes, scattered departmental websites, and jargon-heavy guidelines.
2. **Language Barriers**: Scheme guidelines are predominantly in formal English or Hindi, excluding regional language speakers (such as Marathi).
3. **Complex Eligibility Rules**: Citizens find it daunting to self-evaluate combinations of income thresholds, age brackets, caste categories, landholdings, and document requisites.
4. **AI Hallucination Risks**: Generic AI chatbots frequently invent non-existent benefits, fabricate deadlines, and misinform vulnerable applicants.

---

## 💡 Solution

FinSaarthi solves this through a zero-hallucination, citizen-first architecture:
- **Authoritative Deterministic Engine**: Python-based rule evaluator with 100% mathematical precision. The LLM is never allowed to guess eligibility.
- **Multilingual By Design**: Full native support for **Marathi (मराठी)**, **Hindi (हिंदी)**, and **English** with voice input/output.
- **Explainable Recommendations**: Detailed criteria breakdown showing why a user is eligible, what rules failed, and exactly which documents are missing.
- **Automated Document Intelligence**: Client-side & server-side OCR extraction that parses Aadhaar, Income, and Caste certificates to populate user profiles automatically.
- **Proactive Notifications**: Dynamic alerts triggered when new schemes match saved search interests or citizen demographics.

---

## 🚀 Key Features

- **Government Scheme Discovery**: Instant multilingual semantic and keyword search across central and state schemes.
- **Personalized Eligibility Engine**: Evaluates criteria against demographic attributes with step-by-step audit explanations.
- **Dynamic User Profile**: Progressive demographic questionnaire supporting manual entry, document extraction, and instant criteria updates.
- **Document Processing**: OCR pipeline that reads uploaded documents and maps extracted values directly into citizen profile attributes.
- **Multilingual Support**: Real-time language switching between English, Hindi, and Marathi powered by the Government of India BHASHINI protocol.
- **Source-Grounded AI Assistant**: LangChain RAG pipeline backed by Google Gemini with strict guardrails citing official government portals.
- **Personalized Scheme Alerts**: Automated matching between user search patterns and newly published schemes.
- **Government Resource Registry**: Curated directory of official portals (MahaDBT, PM-KISAN, Stand-Up India, NSP).
- **Persona Switcher**: Instant evaluation testing as Citizen, Government Official, System Admin, or Developer.

---

## 🏗️ System Architecture

FinSaarthi strictly adheres to a modular, multi-tier public digital infrastructure architecture:

```
[Citizen / Official / Admin / Developer]
                   │
                   ▼ (Voice: Marathi/Hindi/English or PWA UI)
┌───────────────────────────────────────────────────────────┐
│               FRONTEND / PWA (Next.js 14)                 │
│  Tailwind CSS • Web Speech API • Multilingual i18n        │
└──────────────────────────┬────────────────────────────────┘
                           │ (localhost:3000)
                           ▼
┌───────────────────────────────────────────────────────────┐
│                 API GATEWAY (NGINX)                       │
│  Reverse Proxy • Rate Limiting • CORS • Security Headers  │
└──────────────────────────┬────────────────────────────────┘
                           │ (localhost:8080)
                           ▼
┌───────────────────────────────────────────────────────────┐
│              BACKEND SERVICES (FastAPI)                   │
│  Auth (JWT/OAuth) • Schemes • Eligibility • OCR • Search  │
└──────┬──────────────┬──────────────┬──────────────┬───────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
│  PostgreSQL  ││ Redis Cache  ││   ChromaDB   ││ Rule Engine  │
│  (19 Tables) ││  & Celery    ││ (BGE-M3 Emb) ││(Deterministic│
│  Structured  ││ Background   ││   Semantic   ││Authoritative)│
└──────────────┘└──────────────┘└──────────────┘└──────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌───────────────────────────────────────────────────────────┐
│        AI / ML & LANGUAGE & CLOUD INFRASTRUCTURE          │
│ LangChain RAG • Gemini 2.5 Flash • BHASHINI (STT/MT/TTS)  │
│ Whisper Fallback • Prometheus /metrics • Docker / K8s     │
└───────────────────────────────────────────────────────────┘
```

### Architectural Guarantees
1. **Rule Engine Authority**: The Large Language Model (LLM) **never** independently decides eligibility. The deterministic rule engine evaluates age, income, state, category, and document proofs with mathematical precision.
2. **Graceful Database Failover**: Seamless failover between cloud PostgreSQL / Supabase and local SQLite to ensure uninterrupted evaluation.
3. **Strict Source Grounding**: RAG prompts enforce that answers are derived only from indexed government scheme records.

---

## 💻 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy ORM, Uvicorn |
| **Database** | PostgreSQL (Supabase) with automated SQLite local failover |
| **Vector DB & Search** | ChromaDB with BGE-M3 multilingual sentence embeddings |
| **AI & NLP** | Google Gemini (2.5 Flash), LangChain, Hugging Face transformers |
| **Language & Voice** | Government of India BHASHINI API (STT / MT / TTS), Web Speech API, Whisper |
| **Caching & Async** | Redis, Celery background worker tasks |
| **DevOps & CI/CD** | Docker, Docker Compose, NGINX API Gateway, Kubernetes manifests, GitHub Actions |

---

## 📂 Project Structure

```
FinSaarthi-AI/
├── .github/
│   └── workflows/
│       └── ci.yml                  # Automated GitHub Actions test & build pipeline
├── backend/
│   ├── main.py                     # FastAPI entrypoint, middleware, telemetry
│   ├── api/                        # 10 modular REST API service routers
│   │   ├── auth.py                 # JWT authentication & persona login
│   │   ├── users.py                # Citizen profile management
│   │   ├── schemes.py              # Scheme catalog & publishing
│   │   ├── eligibility.py          # Deterministic rule evaluation
│   │   ├── documents.py            # Uploads & OCR pipeline
│   │   ├── search.py               # Multilingual semantic search
│   │   ├── assistant.py            # FinSaarthi AI conversational RAG
│   │   ├── notifications.py        # Proactive alerts
│   │   ├── translations.py         # Bhashini STT/MT/TTS integration
│   │   └── analytics.py            # Prometheus metrics & benchmarks
│   ├── services/                   # Service layer business logic
│   ├── rules/                      # Authoritative deterministic rule engine
│   ├── database/                   # PostgreSQL connection & SQLite fallback
│   ├── models/                     # 19 SQLAlchemy relational models
│   ├── schemas/                    # Pydantic v2 schemas
│   ├── data/                       # Official scheme JSON & CSV seed datasets
│   └── tests/                      # Pytest automated test suite (16 test cases)
├── frontend/
│   ├── src/app/                    # Next.js App Router pages
│   │   ├── dashboard/              # Citizen Dashboard
│   │   ├── schemes/                # Schemes directory & detail criteria
│   │   ├── search/                 # Voice & text search
│   │   ├── eligibility/            # Batch rule evaluator & missing proofs
│   │   ├── documents/              # Document upload & OCR preview
│   │   ├── notifications/          # Alert management
│   │   ├── profile/                # Demographic profile builder
│   │   └── assistant/              # AI chat interface
│   ├── src/components/             # UI Components (VoiceInput, Navbar, etc.)
│   └── src/context/                # AuthContext & LanguageContext (EN/HI/MR)
├── k8s/                            # Kubernetes production manifests
├── nginx/                          # NGINX reverse proxy configuration
├── scripts/                        # Ingestion, seeding, and run automation
├── .env.example                    # Sanitized environment template
├── .gitignore                      # Secure Git exclusions
├── CONTRIBUTING.md                 # Contribution and branching guidelines
├── CHANGELOG.md                    # Semantic version history
├── LICENSE                         # MIT License
├── README.md                       # Comprehensive project documentation
├── docker-compose.yml              # Multi-container orchestration
└── requirements.txt                # Python backend dependencies
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.12+
- Node.js 18+ & npm
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/rutujasayare01/FinSaarthi-AI.git
cd FinSaarthi-AI
```

### 2. Configure Environment Variables
Copy the template and configure local or cloud parameters:
```bash
cp .env.example .env
```
*(The platform runs seamlessly out-of-the-box in local mode using SQLite and offline fallbacks).*

---

## 🏃 Running Locally

### Option A: Direct Local Execution

#### Backend
```bash
# Create and activate Python virtual environment
python -m venv .venv
.venv\Scripts\activate      # On Windows
# source .venv/bin/activate  # On Linux/macOS

# Install dependencies
pip install -r requirements.txt
pip install chromadb email-validator httpx

# Ingest official scheme data into local database and vector store
python scripts/ingest_schemes.py backend/data/schemes.json

# Start backend server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

#### Windows One-Click Script
```cmd
scripts\run_all.bat
```

### Option B: Docker Compose
```bash
docker compose up --build
```

---

## 👥 Demo Personas & Credentials

For immediate testing, FinSaarthi includes preconfigured roles accessible via the top-right Persona Switcher:

| Persona | Role | Email | Password | Preconfigured Attributes |
|---|---|---|---|---|
| **Demo Citizen** | `CITIZEN` | `citizen@finsaarthi.gov.in` | `Password@123` | Age 21, Maharashtra, Student (Diploma), Income ₹2,40,000, OBC |
| **Gov Official** | `OFFICIAL` | `official@finsaarthi.gov.in` | `Password@123` | District Social Welfare Officer, Pune |
| **System Admin** | `ADMIN` | `admin@finsaarthi.gov.in` | `Password@123` | Full administrative access, audit logs |
| **Developer** | `DEVELOPER` | `dev@finsaarthi.gov.in` | `Password@123` | Telemetry, Prometheus `/metrics`, API tester |

---

## 🧪 Testing & Verification

Run the automated test suite verifying deterministic rule operators, Demo Citizen eligibility, Bhashini translation, and RAG retrieval:

```bash
# Run pytest with root PYTHONPATH
$env:PYTHONPATH="." ; .venv\Scripts\pytest.exe backend/tests/ -v
```

**Results**: `16 passed` (100% pass rate).

---

## 🌿 Git Maintenance & Collaborative Workflow

Our team strictly adheres to modern software development and Git maintenance practices:

```
main (stable, production-ready)
 │
 ├── feature/dynamic-profile       ──▶ PR #1 ──▶ Merged into main
 ├── feature/document-management   ──▶ PR #2 ──▶ Merged into main
 ├── feature/bhashini-multilingual ──▶ PR #3 ──▶ Merged into main
 ├── feature/scheme-discovery      ──▶ PR #4 ──▶ Merged into main
 ├── feature/notifications         ──▶ PR #5 ──▶ Merged into main
 └── docs/project-documentation    ──▶ PR #6 ──▶ Merged into main
```

- **Feature Branch Isolation**: All work is developed on dedicated `feature/*` branches.
- **Meaningful Commits**: Atomic, imperative commit messages describing functional changes.
- **Peer Code Review**: Changes are integrated via GitHub Pull Requests with linked issues.
- **Continuous Integration**: GitHub Actions automatically validates backend tests and frontend builds on every push and PR.
- **Protected Secrets**: Rigorous `.gitignore` rules prevent credential leaks.

---

## 🤝 Team Collaboration

| Team Member | GitHub Username | Core Responsibilities & Contributions |
|---|---|---|
| **Rutuja Sayare** | [@rutujasayare01](https://github.com/rutujasayare01) | **Project Lead & Architecture**: Repository management, project coordination, workflow standards, release management |
| **Dhananjay Gharat** | [@DhananjayGharat](https://github.com/DhananjayGharat) | **Frontend & AI Assistant**: Next.js 14 UI, dynamic onboarding profile, Gemini RAG assistant integration, voice speech interface |
| **Ruchita Patil** | [@ruchitagp2007](https://github.com/ruchitagp2007) | **Backend & Eligibility Engine**: FastAPI service architecture, deterministic rule evaluator, scheme data catalog, PostgreSQL schemas |
| **Sarthak Dabhade** | [@sarthakdabhade2007](https://github.com/sarthakdabhade2007) | **Document OCR & Quality Assurance**: Document processing pipeline, OCR attribute mapping, automated pytest test suite, documentation |

---

## 🏛️ Government Sources & References

FinSaarthi references official government portals and welfare schemes:
- **MahaDBT Portal** (Government of Maharashtra): `https://mahadbt.maharashtra.gov.in`
- **PM-KISAN Samman Nidhi**: `https://pmkisan.gov.in`
- **Stand-Up India Scheme**: `https://www.standupmitra.in`
- **National Scholarship Portal (NSP)**: `https://scholarships.gov.in`
- **MyScheme Portal**: `https://www.myscheme.gov.in`
- **BHASHINI (National Language Translation Mission)**: `https://bhashini.gov.in`

---

## 🔮 Future Scope

- **DigiLocker Direct API Integration**: Instant document verification via citizen consent tokens without manual uploads.
- **WhatsApp & Telegram Chatbots**: Conversational scheme discovery via regional messaging channels.
- **Offline Edge Inference**: Micro-quantized LLM models running on local village kiosk devices without internet access.
- **State-Wide Entitlement Alerts**: Direct integration with village Gram Panchayat registers for automated enrollment.

---

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
