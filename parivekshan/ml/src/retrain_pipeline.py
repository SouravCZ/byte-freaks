"""
Retrain pipeline for Freebuff delay-risk model.
Loads data from PostgreSQL, trains candidate model, promotes if it beats current.

Usage:
    python retrain_pipeline.py
"""

import os
import sys
import json
import shutil
from datetime import datetime

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
from sklearn.utils.class_weight import compute_sample_weight
import xgboost as xgb

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
MODELS_DIR = os.path.join(SCRIPT_DIR, '..', '..', 'models')

# Minimum accuracy gate
MIN_ACCURACY = 0.30

# Promotion criteria
MAX_REGRESSION = 0.02  # No metric can drop by more than this


def load_data_from_db():
    """Load labeled data from PostgreSQL."""
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

    # Load projects
    query = """
        SELECT p.*, b.name as block_name, b.district
        FROM projects p
        LEFT JOIN blocks b ON b.id = p.block_id
    """
    df = pd.read_sql(query, conn)
    conn.close()

    print(f"Loaded {len(df)} projects from database")
    return df


def load_current_metrics():
    """Load current model metrics for comparison."""
    metrics_path = os.path.join(MODELS_DIR, 'model_metrics.json')
    if os.path.exists(metrics_path):
        with open(metrics_path, 'r') as f:
            return json.load(f)
    return None


def engineer_features(df):
    """Engineer features from project data."""
    df = df.copy()

    # Fill numeric columns
    numeric_cols = [
        'risk_score', 'delay_days', 'lead_time_days',
        'mouzas_affected', 'area_hectares', 'approval_pending_days',
        'stakeholder_responsiveness', 'compensation_disbursed_pct',
        'affected_family_count', 'displaced_families',
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    # Map DB column names to model feature names
    col_mapping = {
        'area_hectares': 'area_acquired_hectares',
        'approval_pending_days': 'dispute_duration_days',
        'stakeholder_responsiveness': 'stakeholder_responsiveness_score',
        'affected_family_count': 'affected_families',
        'legal_dispute_flag': 'legal_dispute_int',
    }

    for old_name, new_name in col_mapping.items():
        if old_name in df.columns:
            df[new_name] = df[old_name]

    # Label encode categoricals
    cat_cols = ['state', 'project_type']
    encoders = {}
    for col in cat_cols:
        if col in df.columns:
            le = LabelEncoder()
            df[f'{col}_enc'] = le.fit_transform(df[col].astype(str))
            encoders[col] = le

    # Create derived features
    if 'compensation_disbursed_pct' in df.columns:
        df['compensation_gap_pct'] = 1.0 - (df['compensation_disbursed_pct'] / 100.0).clip(0, 1)
    else:
        df['compensation_gap_pct'] = 0.5

    if 'affected_families' in df.columns and 'displaced_families' in df.columns:
        df['displaced_ratio'] = df['displaced_families'] / df['affected_families'].clip(lower=1)
    else:
        df['displaced_ratio'] = 0.3

    # Feature columns (matching model_server.py encode_project)
    feature_cols = [
        'area_acquired_hectares',
        'dispute_duration_days',
        'stakeholder_responsiveness_score',
        'compensation_disbursed_pct',
        'affected_families',
        'displaced_families',
        'legal_dispute_int',
        'state_enc',
        'project_type_enc',
        'compensation_gap_pct',
        'displaced_ratio',
    ]

    # Filter to available columns
    feature_cols = [c for c in feature_cols if c in df.columns]

    return df, feature_cols, encoders


def train_candidate(df, feature_cols, encoders):
    """Train a candidate model and return metrics."""
    from train import STAGE_COLS, OPERATIONAL_COLS, COMP_FAM_COLS, BOOL_COLS, CAT_COLS

    # Try to derive risk_category from risk_score
    if 'risk_score' in df.columns:
        df['risk_category'] = pd.cut(
            df['risk_score'],
            bins=[0, 25, 50, 75, 100],
            labels=['Low', 'Medium', 'High', 'Critical'],
            include_lowest=True,
        )
    elif 'delay_days' in df.columns:
        df['risk_category'] = pd.cut(
            df['delay_days'],
            bins=[-1, 30, 90, 180, float('inf')],
            labels=['Low', 'Medium', 'High', 'Critical'],
        )
    else:
        raise ValueError("Cannot derive risk_category from data")

    # Drop rows without labels
    df = df.dropna(subset=['risk_category'])
    if len(df) < 10:
        raise ValueError(f"Not enough labeled data: {len(df)} rows")

    # Encode target
    TARGET_CLASSES = ['Low', 'Medium', 'High', 'Critical']
    target_le = LabelEncoder()
    target_le.classes_ = np.array(TARGET_CLASSES)
    df['target'] = target_le.transform(df['risk_category'])

    X = df[feature_cols].fillna(0).values
    y = df['target'].values

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    sample_weights = compute_sample_weight('balanced', y_train)

    # Train
    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=3,
        gamma=0.1,
        reg_alpha=0.1,
        reg_lambda=1.0,
        objective='binary:logistic',
        eval_metric='auc',
        random_state=42,
    )

    # Use binary for 2-class or multi for 4-class
    if len(TARGET_CLASSES) == 2:
        model = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=3,
            gamma=0.1,
            reg_alpha=0.1,
            reg_lambda=1.0,
            objective='binary:logistic',
            eval_metric='auc',
            random_state=42,
        )
    else:
        model = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=3,
            gamma=0.1,
            reg_alpha=0.1,
            reg_lambda=1.0,
            objective='multi:softprob',
            num_class=len(TARGET_CLASSES),
            eval_metric='mlogloss',
            random_state=42,
        )

    model.fit(X_train, y_train, sample_weight=sample_weights)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    try:
        y_proba = model.predict_proba(X_test)
        if len(TARGET_CLASSES) == 2:
            auc = roc_auc_score(y_test, y_proba[:, 1])
        else:
            auc = roc_auc_score(y_test, y_proba, multi_class='ovr', average='weighted')
    except Exception:
        auc = 0.0

    return {
        'model': model,
        'accuracy': accuracy,
        'f1_weighted': f1,
        'auc': auc,
        'feature_cols': feature_cols,
        'encoders': encoders,
        'target_classes': TARGET_CLASSES,
        'n_train': X_train.shape[0],
        'n_test': X_test.shape[0],
    }


def should_promote(candidate_metrics, current_metrics):
    """Determine if candidate should replace current model."""
    if current_metrics is None:
        return candidate_metrics['accuracy'] >= MIN_ACCURACY

    if candidate_metrics['accuracy'] < MIN_ACCURACY:
        print(f"Candidate accuracy {candidate_metrics['accuracy']:.4f} below minimum {MIN_ACCURACY}")
        return False

    # Check if at least one metric improved
    improved = (
        candidate_metrics['accuracy'] > current_metrics.get('accuracy', 0) or
        candidate_metrics['f1_weighted'] > current_metrics.get('f1_weighted', 0) or
        candidate_metrics['auc'] > current_metrics.get('auc', 0)
    )

    # Check no metric regressed too much
    no_regression = (
        current_metrics.get('accuracy', 0) - candidate_metrics['accuracy'] <= MAX_REGRESSION and
        current_metrics.get('f1_weighted', 0) - candidate_metrics['f1_weighted'] <= MAX_REGRESSION
    )

    return improved and no_regression


def promote_model(candidate_result):
    """Save candidate model as the new current model."""
    os.makedirs(MODELS_DIR, exist_ok=True)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    # Archive old model
    current_path = os.path.join(MODELS_DIR, 'xgb_risk_current.joblib')
    if os.path.exists(current_path):
        archive_path = os.path.join(MODELS_DIR, f'xgb_risk_{timestamp}.joblib')
        shutil.copy2(current_path, archive_path)
        print(f"Archived old model to {archive_path}")

    # Save new model
    model_path = os.path.join(MODELS_DIR, 'xgb_risk_current.joblib')
    joblib.dump(candidate_result['model'], model_path)

    # Save encoders
    encoders_path = os.path.join(MODELS_DIR, 'label_encoders.joblib')
    joblib.dump(candidate_result['encoders'], encoders_path)

    # Save feature meta
    meta_path = os.path.join(MODELS_DIR, 'feature_meta.json')
    feature_meta = {
        'feature_cols': candidate_result['feature_cols'],
        'target_classes': candidate_result['target_classes'],
        'encoder_classes': {
            col: candidate_result['encoders'][col].classes_.tolist()
            for col in candidate_result['encoders']
        },
    }
    with open(meta_path, 'w') as f:
        json.dump(feature_meta, f, indent=2)

    # Save metrics
    metrics_path = os.path.join(MODELS_DIR, 'model_metrics.json')
    metrics = {
        'model_version': f'retrain_{timestamp}',
        'accuracy': candidate_result['accuracy'],
        'f1_weighted': candidate_result['f1_weighted'],
        'auc': candidate_result['auc'],
        'n_train': candidate_result['n_train'],
        'n_test': candidate_result['n_test'],
        'training_date': datetime.now().isoformat(),
    }
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)

    print(f"New model saved to {model_path}")
    return metrics


def run_pipeline():
    """Run the full retrain pipeline."""
    print("=" * 60)
    print("Freebuff Retrain Pipeline")
    print("=" * 60)

    try:
        # Load data
        df = load_data_from_db()
    except Exception as e:
        print(f"Could not load from DB: {e}")
        print("Falling back to synthetic data...")
        csv_path = os.path.join(ML_DIR, '..', 'data', 'output', 'projects.csv')
        if not os.path.exists(csv_path):
            print("Generating synthetic data...")
            from generate_dataset import main as gen_main
            gen_main()
        df = pd.read_csv(csv_path)

    # Load current metrics
    current_metrics = load_current_metrics()
    if current_metrics:
        print(f"Current model - Accuracy: {current_metrics.get('accuracy', 'N/A'):.4f}")
    else:
        print("No current model found.")

    # Engineer features
    df, feature_cols, encoders = engineer_features(df)
    print(f"Features: {feature_cols}")

    # Train candidate
    print("\nTraining candidate model...")
    candidate_result = train_candidate(df, feature_cols, encoders)
    print(f"Candidate - Accuracy: {candidate_result['accuracy']:.4f}, "
          f"F1: {candidate_result['f1_weighted']:.4f}, "
          f"AUC: {candidate_result['auc']:.4f}")

    # Compare and promote
    if should_promote(candidate_result, current_metrics):
        print("\n✓ Candidate promotes successfully!")
        new_metrics = promote_model(candidate_result)
        return {
            'status': 'promoted',
            'metrics': new_metrics,
        }
    else:
        print("\n✗ Candidate does not meet promotion criteria.")
        return {
            'status': 'rejected',
            'candidate': {
                'accuracy': candidate_result['accuracy'],
                'f1_weighted': candidate_result['f1_weighted'],
                'auc': candidate_result['auc'],
            },
            'current': current_metrics,
        }


if __name__ == '__main__':
    result = run_pipeline()
    print(f"\nResult: {json.dumps(result, indent=2, default=str)}")
