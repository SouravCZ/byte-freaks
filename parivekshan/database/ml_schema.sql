-- Parivekshan AI - ML Extension Schema
-- Additional tables for ML model registry and predictions

-- Model registry (tracks trained model versions)
CREATE TABLE IF NOT EXISTS model_registry (
    id            SERIAL PRIMARY KEY,
    model_name    TEXT NOT NULL,
    model_version TEXT NOT NULL,
    accuracy      NUMERIC(5,4),
    f1_weighted   NUMERIC(5,4),
    auc           NUMERIC(5,4),
    feature_count INTEGER,
    training_date TIMESTAMPTZ,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Risk predictions cache
CREATE TABLE IF NOT EXISTS risk_predictions (
    id              SERIAL PRIMARY KEY,
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    risk_category   TEXT NOT NULL CHECK (risk_category IN ('Low', 'Medium', 'High', 'Critical')),
    risk_score      NUMERIC(5,4) NOT NULL,
    probabilities   JSONB,
    top_factors     JSONB,
    model_version   TEXT,
    predicted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Simulation history
CREATE TABLE IF NOT EXISTS simulations (
    id                  SERIAL PRIMARY KEY,
    project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    original_score      NUMERIC(5,4),
    simulated_score     NUMERIC(5,4),
    delta               NUMERIC(5,4),
    modified_features   JSONB,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_model_registry_active ON model_registry(is_active);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_proj ON risk_predictions(project_id);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_date ON risk_predictions(predicted_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulations_proj ON simulations(project_id);
