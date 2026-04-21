from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models  # noqa: F401 — charge tous les modèles pour que SQLAlchemy les enregistre

from routers import (
    auth,
    users,
    departments,
    projects,
    tasks,
    task_history,
    notifications,
    anomalies,
    ai_predictions,
    ai_recommendations,
    workflow_logs,
    webhooks,
)

# ──────────────────────────────────────────
# Création des tables (si elles n'existent pas)
# ──────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ──────────────────────────────────────────
# Application
# ──────────────────────────────────────────
app = FastAPI(
    title="PIOTE — Plateforme Intelligente d'Optimisation des Tâches en Entreprise",
    version="1.0.0",
    description=(
        "API REST du backend PIOTE. "
        "Gestion des tâches, projets, départements, "
        "notifications, anomalies, prédictions IA et workflows n8n."
    ),
)

# ──────────────────────────────────────────
# CORS — à restreindre en production
# ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────
# Routers
# ──────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(departments.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(task_history.router)
app.include_router(notifications.router)
app.include_router(anomalies.router)
app.include_router(ai_predictions.router)
app.include_router(ai_recommendations.router)
app.include_router(workflow_logs.router)
app.include_router(webhooks.router)


# ──────────────────────────────────────────
# Health check
# ──────────────────────────────────────────
@app.get("/health", tags=["Santé"])
def health():
    return {"status": "ok", "service": "piote-backend"}
