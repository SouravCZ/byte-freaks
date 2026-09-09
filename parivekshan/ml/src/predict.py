"""
Prediction module for Freebuff delay-risk model.
Loads trained model and predicts risk categories.
"""

import os
import json
import numpy as np
import joblib

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
MODELS_DIR = os.path.join(SCRIPT_DIR, '..', '..', 'models')


class RiskPredictor:
    """Multi-class risk predictor using XGBoost."""

    def __init__(self):
        self.model = None
        self.feature_meta = None
        self.encoders = None
        self._loaded = False

    def load(self):
        """Load model artifacts from disk."""
        model_path = os.path.join(MODELS_DIR, 'xgb_risk_current.joblib')
        meta_path = os.path.join(MODELS_DIR, 'feature_meta.json')
        encoders_path = os.path.join(MODELS_DIR, 'label_encoders.joblib')

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found: {model_path}")
        if not os.path.exists(meta_path):
            raise FileNotFoundError(f"Feature meta not found: {meta_path}")

        self.model = joblib.load(model_path)
        with open(meta_path, 'r') as f:
            self.feature_meta = json.load(f)

        if os.path.exists(encoders_path):
            self.encoders = joblib.load(encoders_path)
        else:
            self.encoders = {}

        self._loaded = True
        print(f"Model loaded. Features: {len(self.feature_meta['feature_cols'])}, "
              f"Classes: {self.feature_meta['target_classes']}")

    def encode_project(self, project_dict):
        """Encode a project dict into the feature vector expected by the model.

        project_dict keys (flexible, with defaults):
        - Stage durations: duration_proposed_to_scrutiny, etc. (default: 60 each)
        - area_acquired_hectares (default: 5.0)
        - dispute_duration_days (default: 0)
        - pending_approvals_count (default: 0)
        - avg_approval_turnaround_days (default: 20)
        - stakeholder_responsiveness_score (default: 5.0)
        - compensation_assessed_inr (default: 500000)
        - compensation_disbursed_inr (default: 250000)
        - compensation_disbursed_pct (default: 0.5)
        - affected_families (default: 50)
        - displaced_families (default: 20)
        - rr_progress_percent (default: 50)
        - cohort_benchmark_days (default: 600)
        - legal_dispute_flag (default: 0)
        - documentation_complete (default: 1)
        - rr_required (default: 0)
        - project_type (default: 'Infrastructure')
        - state (default: 'Maharashtra')
        - status (default: 'active')
        - dispute_type (default: 'none')
        """
        if not self._loaded:
            self.load()

        p = project_dict
        feature_cols = self.feature_meta['feature_cols']

        # Stage durations with defaults
        stage_defaults = {
            'duration_proposed_to_scrutiny': 60,
            'duration_scrutiny_to_notification': 60,
            'duration_notification_to_declaration': 120,
            'duration_declaration_to_award': 90,
            'duration_award_to_compensation': 60,
            'duration_compensation_to_possession': 60,
            'duration_possession_to_closed': 45,
        }
        for col, default in stage_defaults.items():
            stage_defaults[col] = float(p.get(col, default) or default)

        stage_sum = sum(stage_defaults.values())

        # Build feature dict
        features = {}
        for col in feature_cols:
            if col in stage_defaults:
                features[col] = stage_defaults[col]
            elif col == 'total_stage_duration':
                features[col] = stage_sum
            elif col == 'compensation_gap_pct':
                disp_pct = float(p.get('compensation_disbursed_pct', 50) or 50)
                # If percentage is > 1, treat as 0-100 scale
                if disp_pct > 1:
                    disp_pct = disp_pct / 100.0
                features[col] = max(0.0, 1.0 - disp_pct)
            elif col == 'displaced_ratio':
                affected = max(float(p.get('affected_families', 50) or 50), 1)
                displaced = float(p.get('displaced_families', 20) or 20)
                features[col] = displaced / affected
            elif col == 'legal_dispute_int':
                features[col] = int(p.get('legal_dispute_flag', 0) or p.get('legalDisputeFlag', 0))
            elif col == 'documentation_int':
                features[col] = int(p.get('documentation_complete', 1) or p.get('documentationComplete', 1))
            elif col == 'rr_required_int':
                features[col] = int(p.get('rr_required', 0) or p.get('rrRequired', 0))
            elif col.endswith('_enc'):
                # Categorical encoding
                src_col = col.replace('_enc', '')
                val = str(p.get(src_col, p.get(srcColToKey(src_col), 'unknown')))
                if src_col in self.encoders:
                    le = self.encoders[src_col]
                    if val in le.classes_:
                        features[col] = le.transform([val])[0]
                    else:
                        features[col] = 0  # Unknown category fallback
                else:
                    features[col] = 0
            else:
                # Numeric operational features
                default_val = {
                    'area_acquired_hectares': 5.0,
                    'dispute_duration_days': 0.0,
                    'pending_approvals_count': 0.0,
                    'avg_approval_turnaround_days': 20.0,
                    'stakeholder_responsiveness_score': 5.0,
                    'compensation_assessed_inr': 500000.0,
                    'compensation_disbursed_inr': 250000.0,
                    'compensation_disbursed_pct': 0.5,
                    'affected_families': 50.0,
                    'displaced_families': 20.0,
                    'rr_progress_percent': 50.0,
                    'cohort_benchmark_days': 600.0,
                }.get(col, 0.0)
                features[col] = float(p.get(col, default_val) or default_val)

        # Build array in correct order
        X = np.array([[features[col] for col in feature_cols]], dtype=np.float32)
        return X

    def predict(self, project_dict):
        """Predict risk category for a project.

        Returns dict with:
        - risk_category: str (Low/Medium/High/Critical)
        - risk_score: float (0-1, probability of predicted class)
        - probabilities: dict of {class: probability}
        - top_factors: list of {feature, value, impact}
        """
        if not self._loaded:
            self.load()

        X = self.encode_project(project_dict)

        # Predict
        proba = self.model.predict_proba(X)[0]
        pred_idx = int(np.argmax(proba))
        risk_category = self.feature_meta['target_classes'][pred_idx]
        risk_score = float(proba[pred_idx])

        # Per-class probabilities
        probabilities = {
            cls: float(proba[i])
            for i, cls in enumerate(self.feature_meta['target_classes'])
        }

        # SHAP top factors
        top_factors = self._get_top_factors(X[0], pred_idx)

        return {
            'risk_category': risk_category,
            'risk_score': risk_score,
            'probabilities': probabilities,
            'top_factors': top_factors,
        }

    def _get_top_factors(self, x, class_idx, top_n=5):
        """Get top contributing features via SHAP."""
        try:
            import shap
            shap_path = os.path.join(MODELS_DIR, 'shap_explainer.joblib')
            if os.path.exists(shap_path):
                explainer = joblib.load(shap_path)
                shap_values = explainer.shap_values(x.reshape(1, -1))

                # Handle different SHAP output formats
                if isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
                    # Multi-class: shape (n_samples, n_features, n_classes)
                    vals = shap_values[0, :, class_idx]
                elif isinstance(shap_values, list):
                    vals = shap_values[class_idx][0]
                else:
                    vals = shap_values[0]

                feature_cols = self.feature_meta['feature_cols']
                factors = []
                indices = np.argsort(np.abs(vals))[::-1][:top_n]
                for idx in indices:
                    factors.append({
                        'feature': feature_cols[idx],
                        'value': float(x[idx]),
                        'impact': float(vals[idx]),
                        'direction': 'increases risk' if vals[idx] > 0 else 'decreases risk',
                    })
                return factors
        except Exception as e:
            print(f"SHAP computation failed: {e}")

        # Fallback: use feature importance
        importances = self.model.feature_importances_
        feature_cols = self.feature_meta['feature_cols']
        top_idx = np.argsort(importances)[::-1][:top_n]
        return [
            {
                'feature': feature_cols[idx],
                'value': float(x[idx]),
                'impact': float(importances[idx]),
                'direction': 'important feature',
            }
            for idx in top_idx
        ]


def srcColToKey(col):
    """Map snake_case column name to camelCase dict key."""
    parts = col.split('_')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])


# Singleton
_predictor = None


def get_predictor():
    global _predictor
    if _predictor is None:
        _predictor = RiskPredictor()
        _predictor.load()
    return _predictor


if __name__ == '__main__':
    # Test prediction
    predictor = get_predictor()

    test_project = {
        'project_type': 'Highway',
        'state': 'Maharashtra',
        'status': 'active',
        'dispute_type': 'compensation',
        'area_acquired_hectares': 12.5,
        'dispute_duration_days': 90,
        'pending_approvals_count': 3,
        'avg_approval_turnaround_days': 25.0,
        'stakeholder_responsiveness_score': 4.5,
        'compensation_assessed_inr': 850000,
        'compensation_disbursed_inr': 340000,
        'compensation_disbursed_pct': 0.4,
        'affected_families': 120,
        'displaced_families': 45,
        'rr_progress_percent': 35.0,
        'cohort_benchmark_days': 550,
        'legal_dispute_flag': 1,
        'documentation_complete': 0,
        'rr_required': 1,
    }

    result = predictor.predict(test_project)
    print(json.dumps(result, indent=2))
