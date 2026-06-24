"""
ITE Startup Launch Pad — FastAPI Backend
Serves both the REST API (/api/*) and the static frontend from the repo root.
Single startup command: uvicorn main:app --reload --port 8000
Visit: http://localhost:8000
API docs: http://localhost:8000/docs
"""
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, SessionLocal
from models import Base
from seed import seed

# ── Import all routers ────────────────────────────────────────────────────────
from routers import auth, users, teams, invitations, tasks, submissions, announcements, prev_startups, admin

# ── Create tables & seed ──────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)
db = SessionLocal()
seed(db)
db.close()

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="ITE Startup Launch Pad API",
    description="Backend for the ITE incubator management platform at VNIT Nagpur.",
    version="1.0.0",
)

# CORS — allow all localhost origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ──────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(teams.router)
app.include_router(invitations.router)
app.include_router(tasks.router)
app.include_router(submissions.router)
app.include_router(announcements.router)
app.include_router(prev_startups.router)
app.include_router(admin.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ITE Startup Launch Pad API"}


# ── Serve static frontend from repo root ─────────────────────────────────────
# backend/main.py → go one level up to repo root
FRONTEND_DIR = Path(__file__).parent.parent

if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
