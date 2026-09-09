# Parivekshan AI

Predictive Land Acquisition Delay Monitoring platform. AI-powered decision support for District Collectorates and national infrastructure authorities.

## Architecture

```
parivekshan/
├── backend/          # Node.js + Express API (pg + dotenv)
│   └── src/
│       ├── server.js # entry point
│       ├── app.js    # express app / middlewares
│       ├── db.js     # pg connection pool
│       └── routes/
│           ├── api.js  # /api endpoints
│           └── ml.js   # /api/ml endpoints (proxy to Python ML server)
├── frontend/         # React + Vite + Tailwind CSS + Recharts
│   └── src/
│       ├── pages/    # DistrictLanding, NationalLanding
│       └── components/
├── database/
│   ├── schema.sql    # database schema
│   ├── ml_schema.sql # ML-related tables
│   └── seed.sql      # demo seed data
└── ml/               # ML pipeline (Python)
    └── src/
        ├── train.py              # XGBoost training script
        ├── predict.py            # Prediction module
        ├── explain.py            # SHAP explanations
        ├── model_server.py       # FastAPI prediction server
        ├── retrain_pipeline.py   # Automated retraining
        ├── scheduler.py          # Periodic retrain scheduler
        └── generate_dataset.py   # Synthetic data generator
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local service running)
- Python 3.9+
- pip

## Database Setup

Create the database, role, and schema once:

```bash
# 1. Create database (as postgres superuser)
psql -U postgres -h localhost -c "CREATE DATABASE parivekshan;"
psql -U postgres -h localhost -c "CREATE ROLE parivekshan LOGIN PASSWORD 'parivekshan';"
psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE parivekshan TO parivekshan;"

# 2. Grant schema permissions (PostgreSQL 15+)
psql -U postgres -h localhost -d parivekshan -c "GRANT CREATE ON SCHEMA public TO parivekshan;"

# 3. Apply schema + seed
psql -U parivekshan -h localhost -d parivekshan -f database/schema.sql
psql -U parivekshan -h localhost -d parivekshan -f database/ml_schema.sql
psql -U parivekshan -h localhost -d parivekshan -f database/seed.sql
```

## Backend

```bash
cd backend
npm install
npm run dev        # starts on http://localhost:5000/api
```

Configure connection in `backend/.env`:

```
PGHOST=localhost
PGPORT=5432
PGDATABASE=parivekshan
PGUSER=parivekshan
PGPASSWORD=parivekshan
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
ML_SERVER_URL=http://localhost:8001
```

## Frontend

```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:5173
```

Routes:
- `/`            – landing page hub
- `/district`    – North 24 Parganas District Command Portal
- `/national`    – National Infrastructure Platform

## ML Pipeline Setup

### Install Python Dependencies

```bash
cd ml
pip install -r requirements.txt
```

### Generate Synthetic Dataset

```bash
cd ml/src
python generate_dataset.py
```

### Train the Model

```bash
cd ml/src
python train.py                        # Uses synthetic data
python train.py /path/to/dataset.csv   # Uses custom CSV
```

### Start the ML Model Server

```bash
cd ml/src
python model_server.py
# Or: uvicorn model_server:app --host 0.0.0.0 --port 8001 --reload
```

### Run Retraining Pipeline

```bash
cd ml/src
python retrain_pipeline.py
```

### Start Scheduled Retraining

```bash
cd ml/src
python scheduler.py --interval 1.0  # Retrain every hour
```

## API Endpoints

### Core API (`/api`)

| Method | Endpoint              | Description                         |
|--------|-----------------------|-------------------------------------|
| GET    | `/api/health`         | DB connectivity check               |
| GET    | `/api/stats`          | Dashboard KPIs                      |
| GET    | `/api/projects`       | List projects (filters: `status`, `block`) |
| GET    | `/api/projects/:id`   | Project + drivers + history + alerts |
| POST   | `/api/projects`       | Create project                      |
| GET    | `/api/blocks`         | List blocks                         |
| GET    | `/api/alerts`         | List alerts (`?unread=true`)        |
| PATCH  | `/api/alerts/:id`     | Mark alert read/unread              |

### ML API (`/api/ml`)

| Method | Endpoint              | Description                         |
|--------|-----------------------|-------------------------------------|
| GET    | `/api/ml/health`      | ML server health check              |
| GET    | `/api/ml/info`        | Model metadata and metrics          |
| GET    | `/api/ml/features`    | Model feature list                  |
| POST   | `/api/ml/predict`     | Predict risk for a project          |
| POST   | `/api/ml/simulate`    | Counterfactual simulation           |
| POST   | `/api/ml/batch-predict` | Batch predict for all projects    |
| POST   | `/api/ml/retrain`     | Trigger model retraining            |
| GET    | `/api/ml/registry`    | List model versions                 |

### ML Model Server (Direct, port 8001)

| Method | Endpoint              | Description                         |
|--------|-----------------------|-------------------------------------|
| GET    | `/health`             | Health check                        |
| POST   | `/predict`            | Predict risk category               |
| POST   | `/simulate`           | Counterfactual simulation           |
| GET    | `/model/info`         | Model metadata                      |
| GET    | `/model/features`     | Feature list                        |
| POST   | `/batch-predict`      | Batch predictions                   |

## ML Model Details

### Multi-Class XGBoost Model

- **Algorithm**: XGBoost multi-class classifier
- **Target**: Risk category (Low, Medium, High, Critical)
- **Features**: 29 engineered features
  - 7 stage duration features
  - 7 operational features
  - 5 compensation/family features
  - 3 derived features
  - 3 boolean flags
  - 4 label-encoded categoricals

### Artifacts

All model artifacts are saved in `models/`:

- `xgb_risk_current.joblib` – Active XGBoost model
- `xgb_risk_real_v1.joblib` – Versioned copy
- `shap_explainer.joblib` – SHAP TreeExplainer
- `label_encoders.joblib` – Fitted LabelEncoders
- `feature_meta.json` – Feature column list and metadata
- `model_metrics.json` – Training metrics

### Retraining Pipeline

The retrain pipeline:
1. Loads data from PostgreSQL (or falls back to synthetic data)
2. Trains a candidate XGBoost model
3. Compares against current model metrics
4. Promotes if accuracy/F1/AUC improved AND no metric regressed by >2%

## End-to-End Workflow

1. **Generate data**: `python generate_dataset.py`
2. **Train model**: `python train.py`
3. **Start ML server**: `python model_server.py`
4. **Start backend**: `npm run dev`
5. **Start frontend**: `cd frontend && npm run dev`
6. **Batch predict**: `POST /api/ml/batch-predict`
7. **Get prediction**: `POST /api/ml/predict`
8. **Simulate changes**: `POST /api/ml/simulate`

## Environment Variables

| Variable          | Default               | Description                    |
|-------------------|-----------------------|--------------------------------|
| `PGHOST`          | localhost             | PostgreSQL host                |
| `PGPORT`          | 5432                  | PostgreSQL port                |
| `PGDATABASE`      | parivekshan           | PostgreSQL database            |
| `PGUSER`          | parivekshan           | PostgreSQL user                |
| `PGPASSWORD`      | parivekshan           | PostgreSQL password            |
| `PORT`            | 5000                  | Backend API port               |
| `CLIENT_ORIGIN`   | http://localhost:5173  | Frontend origin for CORS       |
| `ML_SERVER_URL`   | http://localhost:8001  | ML model server URL            |
