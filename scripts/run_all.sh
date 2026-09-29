#!/usr/bin/env bash
set -e

echo "====================================================================="
echo " FinSaarthi - Multilingual Scheme Discovery and Eligibility Platform"
echo "====================================================================="
echo ""

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR"

echo "[1/3] Setting up environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    .venv/bin/pip install -r requirements.txt chromadb email-validator
fi

echo "[2/3] Seeding demo database..."
.venv/bin/python scripts/ingest_schemes.py backend/data/schemes.json

echo "[3/3] Starting Backend & Frontend..."
echo " - Frontend: http://localhost:3000"
echo " - Backend:  http://localhost:8000"
echo " - API Docs: http://localhost:8000/docs"

.venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

cd frontend && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
