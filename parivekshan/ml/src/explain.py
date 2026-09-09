"""
SHAP explanation module for Freebuff delay-risk model.
Provides feature importance and individual prediction explanations.
"""

import os
import json
import numpy as np
import joblib

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
MODELS_DIR = os.path.join(SCRIPT_DIR, '..', '..', 'models')


def explain_prediction(project_dict, risk_result, top_n=5):
    """Generate human-readable explanation for a prediction.

    Args:
        project_dict: Original project feature dict
        risk_result: Output from RiskPredictor.predict()
        top_n: Number of top factors to include

    Returns:
        dict with explanation text and factors
    """
    category = risk_result['risk_category']
    score = risk_result['risk_score']
    factors = risk_result['top_factors']

    # Build explanation
    explanations = {
        'Low': 'This project has a low risk of delay. Factors are within normal ranges.',
        'Medium': 'This project has a moderate risk of delay. Some factors warrant monitoring.',
        'High': 'This project has a high risk of delay. Immediate attention recommended.',
        'Critical': 'This project is at critical risk of delay. Urgent intervention required.',
    }

    result = {
        'risk_category': category,
        'risk_score': score,
        'summary': explanations.get(category, 'Risk assessment complete.'),
        'top_factors': [],
        'recommendations': [],
    }

    # Factor explanations
    factor_descriptions = {
        'total_stage_duration': 'Total time across all acquisition stages',
        'compensation_gap_pct': 'Percentage of compensation yet to be disbursed',
        'displaced_ratio': 'Ratio of displaced families to affected families',
        'dispute_duration_days': 'Duration of ongoing disputes',
        'pending_approvals_count': 'Number of pending approvals',
        'avg_approval_turnaround_days': 'Average time for approval processing',
        'stakeholder_responsiveness_score': 'Stakeholder engagement level (lower = less responsive)',
        'rr_progress_percent': 'Resettlement & Rehabilitation progress',
        'area_acquired_hectares': 'Total land area under acquisition',
        'compensation_disbursed_pct': 'Percentage of compensation disbursed',
        'affected_families': 'Number of families affected',
        'displaced_families': 'Number of families displaced',
        'legal_dispute_int': 'Whether legal disputes are active',
        'documentation_int': 'Whether documentation is complete',
        'rr_required_int': 'Whether R&R is required',
    }

    for f in factors[:top_n]:
        desc = factor_descriptions.get(f['feature'], f['feature'])
        result['top_factors'].append({
            'feature': f['feature'],
            'description': desc,
            'value': f['value'],
            'impact': f['impact'],
            'direction': f['direction'],
        })

    # Generate recommendations
    result['recommendations'] = _generate_recommendations(factors, category)

    return result


def _generate_recommendations(factors, category):
    """Generate actionable recommendations based on risk factors."""
    recs = []

    for f in factors[:3]:
        feat = f['feature']
        val = f['value']
        direction = f['direction']

        if 'compensation_gap' in feat and 'increases' in direction:
            recs.append('Accelerate compensation disbursement to reduce backlog.')
        elif 'dispute_duration' in feat and 'increases' in direction:
            recs.append('Prioritize dispute resolution through mediation or legal channels.')
        elif 'pending_approvals' in feat and 'increases' in direction:
            recs.append('Expedite pending approval clearances through inter-agency coordination.')
        elif 'stakeholder_responsiveness' in feat and 'decreases' in direction:
            recs.append('Improve stakeholder engagement through regular consultations.')
        elif 'rr_progress' in feat and 'decreases' in direction:
            recs.append('Accelerate R&R implementation to build community trust.')
        elif 'total_stage_duration' in feat and 'increases' in direction:
            recs.append('Review stage-wise bottlenecks and implement parallel processing where possible.')
        elif 'documentation_int' in feat and 'decreases' in direction:
            recs.append('Complete all pending documentation to avoid procedural delays.')

    if category == 'Critical':
        recs.append('Consider escalating to district-level monitoring committee.')
    elif category == 'High':
        recs.append('Schedule weekly progress review with all stakeholders.')

    return list(set(recs))  # Deduplicate


def get_model_info():
    """Get information about the current model."""
    meta_path = os.path.join(MODELS_DIR, 'feature_meta.json')
    metrics_path = os.path.join(MODELS_DIR, 'model_metrics.json')

    info = {'model_loaded': False}

    if os.path.exists(meta_path):
        with open(meta_path, 'r') as f:
            info['feature_meta'] = json.load(f)
        info['model_loaded'] = True

    if os.path.exists(metrics_path):
        with open(metrics_path, 'r') as f:
            info['metrics'] = json.load(f)

    # Sanitize NaN/Inf values that break JSON serialization
    import math
    def _sanitize(obj):
        if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
            return None
        elif isinstance(obj, dict):
            return {k: _sanitize(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [_sanitize(v) for v in obj]
        return obj

    info = _sanitize(info)
    return info


if __name__ == '__main__':
    # Demo explanation
    from predict import get_predictor

    predictor = get_predictor()

    test_project = {
        'project_type': 'Highway',
        'state': 'Maharashtra',
        'status': 'active',
        'dispute_type': 'compensation',
        'area_acquired_hectares': 12.5,
        'dispute_duration_days': 120,
        'pending_approvals_count': 4,
        'avg_approval_turnaround_days': 35.0,
        'stakeholder_responsiveness_score': 3.0,
        'compensation_assessed_inr': 1200000,
        'compensation_disbursed_inr': 240000,
        'compensation_disbursed_pct': 0.2,
        'affected_families': 150,
        'displaced_families': 80,
        'rr_progress_percent': 20.0,
        'cohort_benchmark_days': 500,
        'legal_dispute_flag': 1,
        'documentation_complete': 0,
        'rr_required': 1,
    }

    result = predictor.predict(test_project)
    explanation = explain_prediction(test_project, result)

    print(json.dumps(explanation, indent=2))
