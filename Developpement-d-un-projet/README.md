# PIOTE — Backend FastAPI

**Plateforme Intelligente d'Optimisation des Tâches en Entreprise**

---

## Structure du projet

```
piote_backend/
├── main.py                     # Point d'entrée FastAPI
├── database.py                 # Connexion SQLAlchemy + session
├── requirements.txt
├── .env.example
│
├── core/
│   ├── config.py               # Variables d'environnement
│   ├── security.py             # JWT, bcrypt
│   └── dependencies.py         # get_current_user, RBAC
│
├── models/                     # Tables SQLAlchemy (MySQL)
│   ├── user.py
│   ├── department.py
│   ├── project.py
│   ├── task.py
│   ├── task_history.py
│   ├── notification.py
│   ├── anomaly.py
│   ├── ai_prediction.py
│   ├── ai_recommendation.py
│   └── workflow_log.py
│
├── schemas/                    # Validation Pydantic
│   ├── user.py
│   ├── department.py
│   ├── project.py
│   ├── task.py
│   ├── task_history.py
│   ├── notification.py
│   ├── anomaly.py
│   ├── ai_prediction.py
│   ├── ai_recommendation.py
│   └── workflow_log.py
│
├── routers/                    # Endpoints REST
│   ├── auth.py
│   ├── users.py
│   ├── departments.py
│   ├── projects.py
│   ├── tasks.py
│   ├── task_history.py
│   ├── notifications.py
│   ├── anomalies.py
│   ├── ai_predictions.py
│   ├── ai_recommendations.py
│   └── workflow_logs.py
│
└── services/
    └── task_service.py         # Logique métier : historique, notifications, retards
```

---

## Installation

### 1. Prérequis
- Python 3.11+
- MySQL 8.0+

### 2. Cloner et configurer

```bash
# Copier le fichier d'environnement
cp .env.example .env
# Remplir les valeurs dans .env
```

### 3. Créer la base de données MySQL

```sql
CREATE DATABASE piote_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 5. Lancer le serveur

```bash
uvicorn main:app --reload --port 8000
```

L'API est disponible sur : **http://localhost:8000**

La documentation Swagger : **http://localhost:8000/docs**

---

## Endpoints principaux

| Méthode | Route | Rôle requis | Description |
|---------|-------|-------------|-------------|
| POST | `/auth/login` | — | Connexion, retourne access + refresh token |
| POST | `/auth/refresh` | — | Renouvelle l'access token |
| GET | `/users/me` | Tous | Profil de l'utilisateur connecté |
| POST | `/users/` | Admin | Créer un utilisateur |
| GET | `/tasks/dashboard` | Tous | Statistiques (filtré par rôle) |
| GET | `/tasks/delayed` | Manager/Admin | Tâches en retard |
| POST | `/tasks/` | Tous | Créer une tâche |
| PATCH | `/tasks/{id}` | Tous | Modifier une tâche (RBAC appliqué) |
| GET | `/tasks/{id}/history` | Tous | Historique complet d'une tâche |
| GET | `/notifications/` | Tous | Notifications de l'utilisateur |
| PATCH | `/notifications/read-all` | Tous | Marquer tout comme lu |
| GET | `/anomalies/` | Manager/Admin | Liste des anomalies |
| PATCH | `/anomalies/{id}/resolve` | Manager/Admin | Résoudre une anomalie |
| POST | `/ai/predictions/` | — | Enregistrer une prédiction IA |
| GET | `/ai/predictions/high-risk` | Manager/Admin | Tâches à risque élevé (> seuil) |
| PATCH | `/ai/recommendations/{id}/act` | Manager/Admin | Marquer une recommandation comme traitée |
| POST | `/workflow-logs/` | — | n8n enregistre le résultat d'un workflow |

---

## Sécurité (conforme cahier des charges)

- **JWT** : access token 15 min + refresh token 7 jours
- **bcrypt** : 12 rounds de hachage
- **RBAC** : 3 rôles — `admin`, `manager`, `employee`
  - `employee` : voit et modifie uniquement ses propres tâches (statut + heures réelles)
  - `manager` : accès à toutes les tâches, projets, anomalies, recommandations
  - `admin` : accès total, gestion utilisateurs et départements
- **Pagination** : toutes les listes (max 200 items)
- **Historique automatique** : chaque modification de tâche est tracée dans `task_history`

---

## Intégration n8n

n8n communique avec le backend via ces endpoints :

- `POST /notifications/` — créer une notification après détection de retard
- `POST /workflow-logs/` — enregistrer le résultat d'un workflow
- `POST /anomalies/` — signaler une anomalie de temps détectée
- `GET /tasks/delayed` — lire les tâches en retard (workflow surveillance quotidienne)

---

## Intégration Service IA (FastAPI ML — port 8001)

Le service IA Python appelle le backend via :

- `POST /ai/predictions/` — enregistrer une prédiction (met à jour `risk_score` sur la tâche)
- `POST /ai/recommendations/` — enregistrer une recommandation intelligente
