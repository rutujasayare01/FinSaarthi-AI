@echo off
echo =====================================================================
echo  FinSaarthi - Multilingual Scheme Discovery and Eligibility Platform
echo =====================================================================
echo.

cd /d "%~dp0\.."

echo [1/3] Checking Python virtual environment...
if not exist ".venv\Scripts\python.exe" (
    echo [!] Virtual environment not found. Setting up with uv/python...
    uv venv .venv
    uv pip install -r requirements.txt chromadb email-validator --python .venv\Scripts\python.exe
)

echo [2/3] Seeding demo database and ChromaDB vector index...
.venv\Scripts\python.exe scripts\ingest_schemes.py backend\data\schemes.json

echo [3/3] Launching FinSaarthi Services...
echo  - Frontend:  http://localhost:3000
echo  - Backend:   http://localhost:8000
echo  - API Docs:  http://localhost:8000/docs
echo  - Metrics:   http://localhost:8000/metrics
echo.

start "FinSaarthi Backend API (:8000)" cmd /k ".venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

cd frontend
start "FinSaarthi Next.js Frontend (:3000)" cmd /k "npm run dev"

echo All services launched! You can now visit http://localhost:3000 in your browser.
pause
