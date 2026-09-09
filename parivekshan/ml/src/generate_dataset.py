"""
Synthetic dataset generator for Freebuff delay-risk model.
Generates 1500 land acquisition projects with realistic features and risk labels.
Output: data/output/projects.csv
"""

import os
import sys
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

random.seed(42)
np.random.seed(42)

# Configuration
NUM_PROJECTS = 1500
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'output')

# Indian states where land acquisition is common
STATES = [
    'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan',
    'West Bengal', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh', 'Telangana'
]

PROJECT_TYPES = ['Highway', 'Industrial', 'Resettlement', 'Border Infrastructure', 'Railway', 'Power Line']
STATUS_OPTIONS = ['planned', 'active', 'on_hold', 'completed']
DISPUTE_TYPES = ['none', 'compensation', 'boundary', 'encroachment', 'legal_challenge', 'title_dispute']

RISK_CATEGORIES = ['Low', 'Medium', 'High', 'Critical']

# Default stage durations (in days) - based on R&R Act benchmarks
STAGE_DEFAULTS = {
    'duration_proposed_to_scrutiny': (30, 120),
    'duration_scrutiny_to_notification': (30, 90),
    'duration_notification_to_declaration': (60, 180),
    'duration_declaration_to_award': (30, 150),
    'duration_award_to_compensation': (30, 120),
    'duration_compensation_to_possession': (30, 150),
    'duration_possession_to_closed': (30, 90),
}


def generate_project(idx):
    """Generate a single synthetic project with features and risk label."""
    state = random.choice(STATES)
    project_type = random.choice(PROJECT_TYPES)
    status = random.choice(STATUS_OPTIONS)
    dispute_type = random.choice(DISPUTE_TYPES)

    # Stage durations - higher risk projects tend to have longer durations
    risk_factor = random.random()  # 0-1, drives risk level
    stage_durations = {}
    for col, (low, high) in STAGE_DEFAULTS.items():
        # Bias towards longer durations for higher risk
        base = np.random.triangular(low, low + (high - low) * risk_factor, high)
        stage_durations[col] = max(1, int(base))

    total_stage_duration = sum(stage_durations.values())

    # Operational features
    area_acquired = round(np.random.lognormal(mean=1.5, sigma=0.8), 2)
    dispute_duration = int(risk_factor * random.randint(0, 365))
    pending_approvals = int(risk_factor * random.randint(0, 8))
    avg_approval_turnaround = round(np.random.uniform(5, 60), 1)
    stakeholder_responsiveness = round(np.random.beta(2, 5) * 10, 1)

    # Compensation
    compensation_assessed = round(np.random.lognormal(mean=12, sigma=1.5), 0)
    compensation_disbursed_pct = round(max(0, min(1, 1 - risk_factor + np.random.normal(0, 0.2))), 4)
    compensation_disbursed = round(compensation_assessed * compensation_disbursed_pct, 0)

    # Families
    affected_families = random.randint(5, 500)
    displaced_families = int(affected_families * random.uniform(0, 0.8))

    # R&R progress - inversely correlated with risk
    rr_progress = round(max(0, min(100, (1 - risk_factor) * 100 + np.random.normal(0, 15))), 1)

    # Cohort benchmark
    cohort_benchmark = random.randint(400, 800)

    # Boolean flags
    legal_dispute = int(dispute_type in ['legal_challenge', 'title_dispute'] or random.random() < risk_factor * 0.3)
    documentation_complete = int(random.random() > risk_factor * 0.4)
    rr_required = int(project_type in ['Resettlement', 'Highway'] or random.random() < 0.5)

    # Derived features
    compensation_gap = 1.0 - compensation_disbursed_pct
    displaced_ratio = displaced_families / max(affected_families, 1)

    # Assign risk category based on derived factors
    risk_score = (
        0.3 * risk_factor +
        0.2 * (total_stage_duration / 800) +
        0.15 * dispute_duration / 365 +
        0.15 * (1 - compensation_disbursed_pct) +
        0.1 * (1 - rr_progress / 100) +
        0.1 * (pending_approvals / 8)
    )
    risk_score = min(1.0, max(0.0, risk_score))

    if risk_score < 0.25:
        risk_category = 'Low'
    elif risk_score < 0.50:
        risk_category = 'Medium'
    elif risk_score < 0.75:
        risk_category = 'High'
    else:
        risk_category = 'Critical'

    return {
        'project_id': f'PRJ-{idx:05d}',
        'risk_category': risk_category,
        **stage_durations,
        'area_acquired_hectares': area_acquired,
        'dispute_duration_days': dispute_duration,
        'pending_approvals_count': pending_approvals,
        'avg_approval_turnaround_days': avg_approval_turnaround,
        'stakeholder_responsiveness_score': stakeholder_responsiveness,
        'compensation_assessed_inr': compensation_assessed,
        'compensation_disbursed_inr': compensation_disbursed,
        'compensation_disbursed_pct': compensation_disbursed_pct,
        'affected_families': affected_families,
        'displaced_families': displaced_families,
        'rr_progress_percent': rr_progress,
        'cohort_benchmark_days': cohort_benchmark,
        'legal_dispute_flag': legal_dispute,
        'documentation_complete': documentation_complete,
        'rr_required': rr_required,
        'project_type': project_type,
        'state': state,
        'status': status,
        'dispute_type': dispute_type,
    }


def main():
    print("Generating synthetic dataset...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    projects = [generate_project(i) for i in range(NUM_PROJECTS)]
    df = pd.DataFrame(projects)

    output_path = os.path.join(OUTPUT_DIR, 'projects.csv')
    df.to_csv(output_path, index=False)

    print(f"Generated {NUM_PROJECTS} projects -> {output_path}")
    print(f"\nRisk category distribution:")
    print(df['risk_category'].value_counts().to_string())
    print(f"\nFeature columns: {len(df.columns)}")
    print(f"Sample row:\n{df.iloc[0].to_dict()}")


if __name__ == '__main__':
    main()
