# Contributing to FinSaarthi AI

Thank you for contributing to **FinSaarthi AI**! This document outlines our team development guidelines, branching model, pull request protocol, and code standards.

---

## 🧭 Branching Strategy

We follow a structured Git branching workflow based on feature isolation and collaborative peer review:

- **`main`**: Production-ready, stable codebase. Direct commits to `main` are restricted.
- **`feature/<feature-name>`**: Dedicated branches for specific features (e.g., `feature/dynamic-profile`, `feature/document-management`, `feature/bhashini-multilingual`).
- **`docs/<topic>`**: Documentation updates, architectural diagrams, and user guides.
- **`fix/<bug-name>`**: Targeted fixes for verified defects.

---

## 🛠️ Step-by-Step Contribution Workflow

### 1. Identify or Create an Issue
Before starting work, check existing GitHub Issues or open a new issue detailing:
- The problem or feature requirement
- Expected behavior and acceptance criteria
- Scope of work

### 2. Create a Feature Branch
Pull the latest changes from `main` and branch off:
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 3. Implement Changes Locally
Follow project conventions:
- **Backend (FastAPI)**: Strict Pydantic v2 typing, SQLAlchemy models, modular service separation.
- **Frontend (Next.js 14)**: TypeScript, Tailwind CSS, reusable modular components.
- **Security**: Never hardcode credentials, tokens, or environment secrets. Use `.env.example` placeholders.

### 4. Run Automated Tests
Ensure all local verification passes before staging:
```bash
# Backend pytest suite
$env:PYTHONPATH="." ; .venv\Scripts\pytest.exe backend/tests/ -v

# Frontend build check
cd frontend
npm run build
```

### 5. Create Meaningful Commits
Stage specific files and write clear, imperative commit messages describing what changed and why:
```bash
git status
git diff
git add backend/services/eligibility_service.py
git commit -m "Improve eligibility explanation with rule breakdown"
```

**Commit Guidelines**:
- ✅ Good: `Add dynamic user profile onboarding flow`
- ✅ Good: `Implement document OCR preview and validation`
- ❌ Bad: `update`, `final`, `wip`, `test`, `done`

### 6. Push Branch and Open a Pull Request
Push your feature branch to GitHub:
```bash
git push -u origin feature/your-feature-name
```
Navigate to GitHub and create a Pull Request targeting `main`.

---

## 📋 Pull Request Requirements

Every Pull Request must include:
1. **Title**: Concise summary in imperative mood.
2. **Linked Issue**: Reference related issue (e.g., `Closes #4`).
3. **Description & Motivation**: What changed and why it was required.
4. **Summary of Changes**: Bulleted list of affected components and files.
5. **Testing Performed**: Commands run, test cases covered, and manual verification evidence.
6. **Limitations / Considerations**: Any follow-up items or edge cases.

---

## 👥 Peer Review & Merging

1. At least one team peer review approval is required.
2. Ensure automated GitHub Actions CI tests pass.
3. Merge via standard PR merge, and delete the remote feature branch upon completion.

---

## 🔒 Security Best Practices

- Always verify `.gitignore` ignores `.env`, `.venv`, `node_modules`, `chroma_db`, and uploaded user documents.
- Scan staged diffs with `git diff --cached` before committing.
- Report any security concerns or accidental secret exposure immediately.
