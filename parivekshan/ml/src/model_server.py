"""
FastAPI model server for Freebuff delay-risk predictions.
Serves predictions, simulations, and model info.

Run: uvicorn model_server:app --host 0.0.0.0 --port 8001
"""

import os
import sys
import json
import logging
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure module imports work
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

from predict import RiskPredictor, get_predictor
from explain import explain_prediction, get_model_info

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Freebuff ML Model Server",
    description="XGBoost multi-class delay-risk prediction API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic models ---

class ProjectFeatures(BaseModel):
    """Project features for prediction."""
    project_id: Optional[str] = None
    project_type: str = "Infrastructure"
    state: str = "Maharashtra"
    status: str = "active"
    dispute_type: str = "none"
    area_acquired_hectares: float = 5.0
    dispute_duration_days: int = 0
    pending_approvals_count: int = 0
    avg_approval_turnaround_days: float = 20.0
    stakeholder_responsiveness_score: float = 5.0
    compensation_assessed_inr: float = 500000.0
    compensation_disbursed_inr: float = 250000.0
    compensation_disbursed_pct: float = 0.5
    affected_families: int = 50
    displaced_families: int = 20
    rr_progress_percent: float = 50.0
    cohort_benchmark_days: int = 600
    legal_dispute_flag: int = 0
    documentation_complete: int = 1
    rr_required: int = 0
    duration_proposed_to_scrutiny: float = 60
    duration_scrutiny_to_notification: float = 60
    duration_notification_to_declaration: float = 120
    duration_declaration_to_award: float = 90
    duration_award_to_compensation: float = 60
    duration_compensation_to_possession: float = 60
    duration_possession_to_closed: float = 45


class SimulationRequest(BaseModel):
    """Request for counterfactual simulation."""
    project: ProjectFeatures
    modified_features: dict = Field(default_factory=dict)


class PredictionResponse(BaseModel):
    """Response from prediction."""
    risk_category: str
    risk_score: float
    probabilities: dict
    top_factors: list
    explanation: Optional[dict] = None


# --- Global predictor ---
_predictor: Optional[RiskPredictor] = None


def get_loaded_predictor() -> RiskPredictor:
    global _predictor
    if _predictor is None:
        _predictor = get_predictor()
    return _predictor


# --- Routes ---

@app.get("/health")
async def health():
    """Health check."""
    try:
        p = get_loaded_predictor()
        return {"status": "ok", "model_loaded": p._loaded}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/predict")
async def predict(project: ProjectFeatures):
    """Predict risk category for a project."""
    try:
        predictor = get_loaded_predictor()
        project_dict = project.model_dump()
        result = predictor.predict(project_dict)

        # Add explanation
        explanation = explain_prediction(project_dict, result)
        result['explanation'] = explanation

        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=f"Model not trained: {e}")
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/simulate")
async def simulate(request: SimulationRequest):
    """Counterfactual simulation - predict with modified features."""
    try:
        predictor = get_loaded_predictor()
        original_dict = request.project.model_dump()

        # Original prediction
        original = predictor.predict(original_dict)

        # Modified prediction
        modified_dict = {**original_dict, **request.modified_features}
        simulated = predictor.predict(modified_dict)

        delta = simulated['risk_score'] - original['risk_score']

        return {
            'original_score': original['risk_score'],
            'original_category': original['risk_category'],
            'simulated_score': simulated['risk_score'],
            'simulated_category': simulated['risk_category'],
            'delta': delta,
            'original_probabilities': original['probabilities'],
            'simulated_probabilities': simulated['probabilities'],
            'top_factors': simulated['top_factors'],
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=f"Model not trained: {e}")
    except Exception as e:
        logger.error(f"Simulation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/model/info")
async def model_info():
    """Get model metadata and metrics."""
    try:
        info = get_model_info()
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/model/features")
async def model_features():
    """Get the list of features used by the model."""
    try:
        predictor = get_loaded_predictor()
        return {
            'feature_cols': predictor.feature_meta['feature_cols'],
            'target_classes': predictor.feature_meta['target_classes'],
            'n_features': len(predictor.feature_meta['feature_cols']),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/batch-predict")
async def batch_predict(projects: list[ProjectFeatures]):
    """Batch predict for multiple projects."""
    try:
        predictor = get_loaded_predictor()
        results = []
        for project in projects:
            project_dict = project.model_dump()
            result = predictor.predict(project_dict)
            result['project_id'] = project.project_id
            results.append(result)
        return {'predictions': results, 'count': len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
