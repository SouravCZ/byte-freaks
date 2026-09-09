"""
Merge new states mock data into existing datasets and retrain the model.
1. Appends new projects to frontend/dist/west_bengal_projects.csv
2. Converts new data to ML training format and appends to ml/data/output/projects.csv
3. Retrains the XGBoost model with the combined dataset
"""

import os
import sys
import pandas as pd
import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
ROOT_DIR = os.path.join(SCRIPT_DIR, '..', '..')

NEW_DATA_PATH = os.path.join(os.path.expanduser('~'), 'Downloads', 'new_states_mock_data.csv')
FRONTEND_CSV = os.path.join(ROOT_DIR, 'frontend', 'dist', 'west_bengal_projects.csv')
TRAINING_CSV = os.path.join(ML_DIR, 'data', 'output', 'projects.csv')

# Columns the frontend expects (MLProjects.jsx -> projectToMLPayload)
FRONTEND_COLS = [
    'case_id', 'project_name', 'project_type', 'implementing_agency', 'state',
    'district', 'latitude', 'longitude', 'area_acquired_hectares', 'status',
    'start_date', 'last_updated',
    'duration_proposed_to_scrutiny', 'duration_scrutiny_to_notification',
    'duration_notification_to_declaration', 'duration_declaration_to_award',
    'duration_award_to_compensation', 'duration_compensation_to_possession',
    'duration_possession_to_closed',
    'legal_dispute_flag', 'dispute_type', 'dispute_duration_days',
    'documentation_complete', 'pending_approvals_count',
    'avg_approval_turnaround_days', 'stakeholder_responsiveness_score',
    'compensation_assessed_inr', 'compensation_disbursed_inr',
    'compensation_disbursed_pct', 'affected_families', 'displaced_families',
    'rr_required', 'rr_progress_percent', 'cohort_benchmark_days',
    'actual_total_duration_days', 'delay_days', 'delay_ratio',
    'risk_category', 'delay_probability',
]

# Columns for ML training (matching train.py expected format)
TRAINING_COLS = [
    'project_id', 'risk_category',
    'duration_proposed_to_scrutiny', 'duration_scrutiny_to_notification',
    'duration_notification_to_declaration', 'duration_declaration_to_award',
    'duration_award_to_compensation', 'duration_compensation_to_possession',
    'duration_possession_to_closed',
    'area_acquired_hectares', 'dispute_duration_days', 'pending_approvals_count',
    'avg_approval_turnaround_days', 'stakeholder_responsiveness_score',
    'compensation_assessed_inr', 'compensation_disbursed_inr',
    'compensation_disbursed_pct', 'affected_families', 'displaced_families',
    'rr_progress_percent', 'cohort_benchmark_days',
    'legal_dispute_flag', 'documentation_complete', 'rr_required',
    'project_type', 'state', 'status', 'dispute_type',
]


def merge_frontend_csv():
    """Merge new data into the frontend CSV."""
    print("=== Merging into frontend CSV ===")
    new_df = pd.read_csv(NEW_DATA_PATH)
    existing_df = pd.read_csv(FRONTEND_CSV)

    # Ensure both have the same columns
    all_cols = list(set(list(existing_df.columns) + list(new_df.columns)))
    for col in all_cols:
        if col not in existing_df.columns:
            existing_df[col] = ''
        if col not in new_df.columns:
            new_df[col] = ''

    # Reorder columns to match frontend expectations
    ordered_cols = [c for c in FRONTEND_COLS if c in all_cols]
    extra_cols = [c for c in all_cols if c not in FRONTEND_COLS]
    final_cols = ordered_cols + extra_cols

    existing_df = existing_df[final_cols]
    new_df = new_df[final_cols]

    merged = pd.concat([existing_df, new_df], ignore_index=True)
    merged.to_csv(FRONTEND_CSV, index=False)
    print(f"  Frontend CSV: {len(existing_df)} -> {len(merged)} rows")
    return merged


def merge_training_csv():
    """Convert new data to ML training format and merge."""
    print("\n=== Merging into training CSV ===")
    new_df = pd.read_csv(NEW_DATA_PATH)
    existing_df = pd.read_csv(TRAINING_CSV)

    # Convert new data to training format
    new_training = pd.DataFrame()
    new_training['project_id'] = new_df['case_id']
    new_training['risk_category'] = new_df['risk_category']

    # Copy numeric features directly
    num_features = [
        'duration_proposed_to_scrutiny', 'duration_scrutiny_to_notification',
        'duration_notification_to_declaration', 'duration_declaration_to_award',
        'duration_award_to_compensation', 'duration_compensation_to_possession',
        'duration_possession_to_closed', 'area_acquired_hectares',
        'dispute_duration_days', 'pending_approvals_count',
        'avg_approval_turnaround_days', 'stakeholder_responsiveness_score',
        'compensation_assessed_inr', 'compensation_disbursed_inr',
        'compensation_disbursed_pct', 'affected_families', 'displaced_families',
        'rr_progress_percent', 'cohort_benchmark_days',
    ]
    for col in num_features:
        new_training[col] = pd.to_numeric(new_df[col], errors='coerce').fillna(0)

    # Boolean -> int
    new_training['legal_dispute_flag'] = new_df['legal_dispute_flag'].apply(
        lambda x: 1 if str(x).strip().lower() in ('true', '1', 'yes') else 0
    )
    new_training['documentation_complete'] = new_df['documentation_complete'].apply(
        lambda x: 1 if str(x).strip().lower() in ('true', '1', 'yes') else 0
    )
    new_training['rr_required'] = new_df['rr_required'].apply(
        lambda x: 1 if str(x).strip().lower() in ('true', '1', 'yes') else 0
    )

    # Categorical
    new_training['project_type'] = new_df['project_type']
    new_training['state'] = new_df['state']
    new_training['status'] = new_df['status']
    new_training['dispute_type'] = new_df['dispute_type'].fillna('none')

    # Ensure columns are in the same order
    new_training = new_training[TRAINING_COLS]

    # Remove duplicates by project_id if any overlap
    existing_ids = set(existing_df['project_id'].values) if 'project_id' in existing_df.columns else set()
    new_training = new_training[~new_training['project_id'].isin(existing_ids)]

    merged = pd.concat([existing_df, new_training], ignore_index=True)
    merged.to_csv(TRAINING_CSV, index=False)
    print(f"  Training CSV: {len(existing_df)} -> {len(merged)} rows")
    print(f"  New rows added: {len(new_training)}")
    return merged


def retrain_model():
    """Retrain the model using the updated training script."""
    print("\n=== Retraining ML Model ===")
    from train import train
    model, metrics = train(TRAINING_CSV)
    return metrics


if __name__ == '__main__':
    print("=" * 60)
    print("Merge & Retrain Pipeline")
    print("=" * 60)

    # Step 1: Merge frontend CSV
    merge_frontend_csv()

    # Step 2: Merge training CSV
    merge_training_csv()

    # Step 3: Retrain
    metrics = retrain_model()

    print("\n" + "=" * 60)
    print("Pipeline Complete!")
    print(f"Accuracy:  {metrics['accuracy']:.4f}")
    print(f"F1:        {metrics['f1_weighted']:.4f}")
    print(f"CV Mean:   {metrics['cv_mean']:.4f} +/- {metrics['cv_std']:.4f}")
    print(f"Train:     {metrics['n_train']} samples")
    print(f"Test:      {metrics['n_test']} samples")
    print("=" * 60)
