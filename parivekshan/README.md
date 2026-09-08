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
│           └── api.js # /api endpoints
├── frontend/         # React + Vite + Tailwind CSS + Recharts
│   └── src/
│       ├── pages/    # DistrictLanding, NationalLanding
│       └── components/
├── database/
│   ├── schema.sql    # database schema
│   └── seed.sql      # demo seed data
└── ml/               # ML pipeline (Python)
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local service running)

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

## API Endpoints

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
