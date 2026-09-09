"""
Multi-class XGBoost training script for Freebuff delay-risk model.
Predicts risk categories: Low, Medium, High, Critical.

Usage:
    python train.py [path_to_dataset.csv]

If no CSV is provided, generates synthetic data first.
"""

import os
import sys
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)
from sklearn.utils.class_weight import compute_sample_weight
import xgboost as xgb

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
MODELS_DIR = os.path.join(SCRIPT_DIR, '..', '..', 'models')
DATA_DIR = os.path.join(SCRIPT_DIR, '..', 'data', 'output')

# Target class order (MUST match model_server.py)
TARGET_CLASSES = ['Low', 'Medium', 'High', 'Critical']

# Stage duration columns
STAGE_COLS = [
    'duration_proposed_to_scrutiny',
    'duration_scrutiny_to_notification',
    'duration_notification_to_declaration',
    'duration_declaration_to_award',
    'duration_award_to_compensation',
    'duration_compensation_to_possession',
    'duration_possession_to_closed',
]

# Operational columns
OPERATIONAL_COLS = [
    'area_acquired_hectares',
    'dispute_duration_days',
    'pending_approvals_count',
    'avg_approval_turnaround_days',
    'stakeholder_responsiveness_score',
    'compensation_assessed_inr',
    'compensation_disbursed_inr',
]

# Compensation and families columns
COMP_FAM_COLS = [
    'compensation_disbursed_pct',
    'affected_families',
    'displaced_families',
    'rr_progress_percent',
    'cohort_benchmark_days',
]

# Boolean columns
BOOL_COLS = [
    'legal_dispute_flag',
    'documentation_complete',
    'rr_required',
]

# Categorical columns
CAT_COLS = [
    'project_type',
    'state',
    'status',
    'dispute_type',
]

# Leakage columns to exclude
LEAKAGE_COLS = ['delay_days', 'delay_ratio', 'actual_total_duration_days', 'delay_probability']


def engineer_features(df):
    """Engineer features from raw data."""
    df = df.copy()

    # Derived features
    df['total_stage_duration'] = df[STAGE_COLS].sum(axis=1)
    df['compensation_gap_pct'] = 1.0 - df['compensation_disbursed_pct'].fillna(0)
    df['displaced_ratio'] = df['displaced_families'] / df['affected_families'].clip(lower=1)

    # Boolean to int
    df['legal_dispute_int'] = df['legal_dispute_flag'].astype(int)
    df['documentation_int'] = df['documentation_complete'].astype(int)
    df['rr_required_int'] = df['rr_required'].astype(int)

    # Label encode categoricals
    encoders = {}
    for col in CAT_COLS:
        le = LabelEncoder()
        df[f'{col}_enc'] = le.fit_transform(df[col].astype(str))
        encoders[col] = le

    return df, encoders


def get_feature_columns():
    """Return the ordered list of feature column names."""
    return (
        STAGE_COLS
        + OPERATIONAL_COLS
        + COMP_FAM_COLS
        + ['total_stage_duration', 'compensation_gap_pct', 'displaced_ratio']
        + ['legal_dispute_int', 'documentation_int', 'rr_required_int']
        + [f'{col}_enc' for col in CAT_COLS]
    )


def train(csv_path=None):
    """Train the multi-class XGBoost model."""
    os.makedirs(MODELS_DIR, exist_ok=True)

    # Load data
    if csv_path and os.path.exists(csv_path):
        print(f"Loading dataset from {csv_path}")
        df = pd.read_csv(csv_path)
    else:
        print("No CSV provided, generating synthetic dataset...")
        from generate_dataset import main as gen_main
        gen_main()
        csv_path = os.path.join(DATA_DIR, 'projects.csv')
        df = pd.read_csv(csv_path)

    print(f"Dataset shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")

    # Feature engineering
    df, encoders = engineer_features(df)
    feature_cols = get_feature_columns()

    # Encode target
    target_le = LabelEncoder()
    target_le.classes_ = np.array(TARGET_CLASSES)
    df['target'] = target_le.transform(df['risk_category'])

    # Fill missing features with 0
    X = df[feature_cols].fillna(0).values
    y = df['target'].values

    print(f"\nFeature matrix shape: {X.shape}")
    print(f"Feature columns: {feature_cols}")
    print(f"\nTarget distribution:")
    for cls, count in zip(*np.unique(y, return_counts=True)):
        print(f"  {TARGET_CLASSES[cls]}: {count} ({count/len(y)*100:.1f}%)")

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    print(f"\nTrain: {X_train.shape[0]}, Test: {X_test.shape[0]}")

    # Compute sample weights for class imbalance
    sample_weights = compute_sample_weight('balanced', y_train)

    # Train XGBoost
    print("\nTraining XGBoost multi-class model...")
    model = xgb.XGBClassifier(
        n_estimators=300,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=5,
        gamma=0.1,
        reg_alpha=0.1,
        reg_lambda=1.0,
        objective='multi:softprob',
        num_class=4,
        eval_metric='mlogloss',
        random_state=42,
        use_label_encoder=False,
    )

    model.fit(
        X_train, y_train,
        sample_weight=sample_weights,
        eval_set=[(X_test, y_test)],
        verbose=50,
    )

    # Evaluate
    print("\n--- Evaluation ---")
    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1:        {f1:.4f}")
    print(f"\nConfusion Matrix:\n{cm}")
    print(f"\nClassification Report:\n{classification_report(y_test, y_pred, target_names=TARGET_CLASSES)}")

    # 5-fold cross-validation
    print("Running 5-fold stratified cross-validation...")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model, X, y, cv=skf, scoring='accuracy')
    print(f"CV Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # Baseline (majority class)
    from collections import Counter
    majority_class_count = Counter(y_test).most_common(1)[0][1]
    baseline_acc = majority_class_count / len(y_test)
    print(f"Baseline accuracy (majority class): {baseline_acc:.4f}")

    # Feature importance
    importances = dict(zip(feature_cols, model.feature_importances_))
    sorted_importances = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    print("\nTop 10 features:")
    for feat, imp in sorted_importances[:10]:
        print(f"  {feat}: {imp:.4f}")

    # SHAP explanations
    print("\nComputing SHAP explanations...")
    try:
        import shap
        explainer = shap.TreeExplainer(model)
        shap_explainer_path = os.path.join(MODELS_DIR, 'shap_explainer.joblib')
        joblib.dump(explainer, shap_explainer_path)
        print(f"SHAP explainer saved to {shap_explainer_path}")
    except ImportError:
        print("SHAP not installed, skipping explainer creation.")
        explainer = None

    # Save model artifacts
    model_path = os.path.join(MODELS_DIR, 'xgb_risk_current.joblib')
    model_versioned_path = os.path.join(MODELS_DIR, 'xgb_risk_real_v2.joblib')
    encoders_path = os.path.join(MODELS_DIR, 'label_encoders.joblib')
    meta_path = os.path.join(MODELS_DIR, 'feature_meta.json')
    metrics_path = os.path.join(MODELS_DIR, 'model_metrics.json')

    joblib.dump(model, model_path)
    joblib.dump(model, model_versioned_path)
    joblib.dump(encoders, encoders_path)

    # Feature meta
    feature_meta = {
        'feature_cols': feature_cols,
        'target_classes': TARGET_CLASSES,
        'encoder_classes': {
            col: encoders[col].classes_.tolist() for col in CAT_COLS
        },
    }
    with open(meta_path, 'w') as f:
        json.dump(feature_meta, f, indent=2)

    # Model metrics
    metrics = {
        'model_version': 'real_v1',
        'accuracy': float(accuracy),
        'precision_weighted': float(precision),
        'recall_weighted': float(recall),
        'f1_weighted': float(f1),
        'confusion_matrix': cm.tolist(),
        'baseline_accuracy': float(baseline_acc),
        'cv_mean': float(cv_scores.mean()),
        'cv_std': float(cv_scores.std()),
        'feature_importance': {k: float(v) for k, v in sorted_importances[:20]},
        'n_train': int(X_train.shape[0]),
        'n_test': int(X_test.shape[0]),
        'n_features': len(feature_cols),
        'training_date': pd.Timestamp.now().isoformat(),
    }
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)

    print(f"\n--- Artifacts Saved ---")
    print(f"Model:      {model_path}")
    print(f"Encoders:   {encoders_path}")
    print(f"Meta:       {meta_path}")
    print(f"Metrics:    {metrics_path}")

    # Update model registry in database
    try:
        _update_model_registry(metrics)
    except Exception as e:
        print(f"Warning: Could not update model registry: {e}")

    return model, metrics


def _update_model_registry(metrics):
    """Update model_registry table in PostgreSQL via psycopg2."""
    try:
        import psycopg2
        from dotenv import load_dotenv
        load_dotenv(os.path.join(ML_DIR, '..', 'backend', '.env'))

        conn = psycopg2.connect(
            host=os.getenv('PGHOST', 'localhost'),
            port=os.getenv('PGPORT', '5432'),
            dbname=os.getenv('PGDATABASE', 'parivekshan'),
            user=os.getenv('PGUSER', 'parivekshan'),
            password=os.getenv('PGPASSWORD', 'parivekshan'),
        )
        cur = conn.cursor()

        # Create table if not exists
        cur.execute("""
            CREATE TABLE IF NOT EXISTS model_registry (
                id SERIAL PRIMARY KEY,
                model_name TEXT NOT NULL,
                model_version TEXT NOT NULL,
                accuracy NUMERIC(5,4),
                f1_weighted NUMERIC(5,4),
                feature_count INTEGER,
                training_date TIMESTAMPTZ,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        """)

        # Deactivate old versions
        cur.execute("UPDATE model_registry SET is_active = FALSE WHERE model_name = 'xgb_risk'")

        # Insert new version
        cur.execute("""
            INSERT INTO model_registry (model_name, model_version, accuracy, f1_weighted, feature_count, training_date, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, TRUE)
        """, (
            'xgb_risk',
            metrics['model_version'],
            metrics['accuracy'],
            metrics['f1_weighted'],
            metrics['n_features'],
            metrics['training_date'],
        ))

        conn.commit()
        cur.close()
        conn.close()
        print("Model registry updated in database.")
    except Exception as e:
        print(f"Database update skipped: {e}")


if __name__ == '__main__':
    csv_path = sys.argv[1] if len(sys.argv) > 1 else None
    train(csv_path)
