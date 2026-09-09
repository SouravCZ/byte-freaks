-- Parivekshan AI - PostgreSQL Schema
-- Predictive Land Acquisition Delay Monitoring

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Lookup / reference tables
-- ---------------------------------------------------------------------------

-- District blocks (state context)
CREATE TABLE IF NOT EXISTS blocks (
    id            SERIAL PRIMARY KEY,
    name          TEXT NOT NULL UNIQUE,
    district      TEXT NOT NULL DEFAULT 'Unknown',
    mouza_count   INTEGER DEFAULT 0,
    risk_score    NUMERIC(5, 2) DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project status enum values: 'planned','active','on_hold','completed','cancelled'
CREATE TABLE IF NOT EXISTS projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    block_id        INTEGER REFERENCES blocks(id) ON DELETE SET NULL,
    project_type    TEXT NOT NULL DEFAULT 'Infrastructure',
    description     TEXT,
    status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('planned','active','on_hold','completed','cancelled')),
    risk_score      NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    delay_days      INTEGER NOT NULL DEFAULT 0,
    lead_time_days  INTEGER NOT NULL DEFAULT 0,
    mouzas_affected INTEGER NOT NULL DEFAULT 0,
    start_date      DATE,
    target_date     DATE,
    actual_date     DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Risk driver attribution (SHAP-style factors)
CREATE TABLE IF NOT EXISTS risk_drivers (
    id            SERIAL PRIMARY KEY,
    project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    factor        TEXT NOT NULL,
    impact_pct    NUMERIC(5, 2) NOT NULL CHECK (impact_pct BETWEEN 0 AND 100),
    rank          INTEGER,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Delay / risk history snapshots for trend charts
CREATE TABLE IF NOT EXISTS risk_history (
    id          BIGSERIAL PRIMARY KEY,
    project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    risk_score  NUMERIC(5, 2) NOT NULL,
    recorded_on DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Alert / notification records
CREATE TABLE IF NOT EXISTS alerts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
    severity    TEXT NOT NULL DEFAULT 'info'
                CHECK (severity IN ('critical','high','moderate','low','info')),
    title       TEXT NOT NULL,
    message     TEXT,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles (RBAC)
CREATE TABLE IF NOT EXISTS users (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    designation  TEXT,
    department   TEXT,
    email        TEXT NOT NULL UNIQUE,
    role         TEXT NOT NULL DEFAULT 'viewer'
                 CHECK (role IN ('collector','adm','bdo','lao','viewer','admin')),
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_block      ON projects(block_id);
CREATE INDEX IF NOT EXISTS idx_projects_status     ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_risk       ON projects(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_risk_drivers_proj   ON risk_drivers(project_id);
CREATE INDEX IF NOT EXISTS idx_risk_history_proj   ON risk_history(project_id, recorded_on);
CREATE INDEX IF NOT EXISTS idx_alerts_project      ON alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_unread       ON alerts(is_read);

-- Updated-at trigger helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_updated ON projects;
CREATE TRIGGER trg_projects_updated
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
