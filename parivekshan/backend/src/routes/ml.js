import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

// ML model server URL (Python FastAPI)
const ML_SERVER_URL = process.env.ML_SERVER_URL || 'http://localhost:8001'

// Helper to call ML server
async function callMLServer(path, method = 'GET', body = null) {
  const url = `${ML_SERVER_URL}${path}`
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) {
    options.body = JSON.stringify(body)
  }
  const response = await fetch(url, options)
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ML Server error: ${response.status} - ${error}`)
  }
  return response.json()
}

// GET /api/ml/health - ML server health check
router.get('/health', async (_req, res) => {
  try {
    const result = await callMLServer('/health')
    res.json(result)
  } catch (err) {
    res.status(503).json({
      status: 'error',
      message: 'ML server unavailable',
      detail: err.message,
    })
  }
})

// GET /api/ml/info - Model metadata and metrics
router.get('/info', async (_req, res) => {
  try {
    const result = await callMLServer('/model/info')
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/ml/features - Model feature list
router.get('/features', async (_req, res) => {
  try {
    const result = await callMLServer('/model/features')
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ml/predict - Predict risk for a project
router.post('/predict', async (req, res) => {
  try {
    const result = await callMLServer('/predict', 'POST', req.body)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ml/simulate - Counterfactual simulation
router.post('/simulate', async (req, res) => {
  try {
    const result = await callMLServer('/simulate', 'POST', req.body)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ml/batch-predict - Batch predict for all projects missing predictions
router.post('/batch-predict', async (_req, res) => {
  try {
    // Fetch projects from database
    const { rows: projects } = await query(`
      SELECT p.id, p.code, p.name, p.project_type, p.status,
             p.risk_score, p.delay_days, p.lead_time_days,
             p.mouzas_affected,
             b.name as state, b.district
      FROM projects p
      LEFT JOIN blocks b ON b.id = p.block_id
      ORDER BY p.risk_score DESC
    `)

    // Map to ML server format
    const mlProjects = projects.map(p => ({
      project_id: p.id,
      project_type: p.project_type || 'Infrastructure',
      state: p.state || 'Maharashtra',
      status: p.status || 'active',
      dispute_type: 'none',
      area_acquired_hectares: p.mouzas_affected * 2.5 || 5.0,
      dispute_duration_days: p.delay_days || 0,
      pending_approvals_count: Math.floor((p.risk_score || 0) / 25),
      avg_approval_turnaround_days: 20.0,
      stakeholder_responsiveness_score: Math.max(1, 10 - (p.risk_score || 0) / 10),
      compensation_assessed_inr: 500000,
      compensation_disbursed_inr: 500000 * (1 - (p.risk_score || 0) / 100),
      compensation_disbursed_pct: 1 - (p.risk_score || 0) / 100,
      affected_families: p.mouzas_affected * 8 || 50,
      displaced_families: Math.floor((p.mouzas_affected * 8 || 50) * 0.4),
      rr_progress_percent: Math.max(0, 100 - (p.risk_score || 0)),
      cohort_benchmark_days: 600,
      legal_dispute_flag: p.risk_score > 60 ? 1 : 0,
      documentation_complete: p.risk_score < 50 ? 1 : 0,
      rr_required: p.project_type === 'Resettlement' ? 1 : 0,
    }))

    // Call ML server for batch prediction
    const result = await callMLServer('/batch-predict', 'POST', mlProjects)

    // Store predictions in risk_drivers table
    for (const pred of result.predictions) {
      if (pred.project_id) {
        // Update project risk score
        const newScore = Math.round(pred.risk_score * 100)
        await query(
          'UPDATE projects SET risk_score = $2 WHERE id = $1',
          [pred.project_id, newScore]
        )

        // Clear old drivers
        await query(
          'DELETE FROM risk_drivers WHERE project_id = $1',
          [pred.project_id]
        )

        // Insert new SHAP-style drivers
        if (pred.top_factors) {
          for (const factor of pred.top_factors) {
            const impactPct = Math.min(100, Math.abs(factor.impact) * 100)
            await query(
              `INSERT INTO risk_drivers (project_id, factor, impact_pct, rank)
               VALUES ($1, $2, $3, $4)`,
              [pred.project_id, factor.feature, impactPct, pred.top_factors.indexOf(factor) + 1]
            )
          }
        }
      }
    }

    res.json({
      status: 'success',
      predictions_count: result.count,
      predictions: result.predictions,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ml/retrain - Trigger model retraining
router.post('/retrain', async (_req, res) => {
  try {
    // Call Python retrain script directly
    const { execSync } = await import('child_process')
    const mlDir = new URL('../../ml/src', import.meta.url).pathname
    const output = execSync(`cd "${mlDir}" && python retrain_pipeline.py`, {
      encoding: 'utf-8',
      timeout: 300000, // 5 minutes
    })
    res.json({ status: 'success', output })
  } catch (err) {
    res.status(500).json({ error: err.message, output: err.stdout })
  }
})

// GET /api/ml/registry - List model versions
router.get('/registry', async (_req, res) => {
  try {
    const { rows } = await query(`
      SELECT * FROM model_registry
      ORDER BY created_at DESC
      LIMIT 10
    `)
    res.json(rows)
  } catch (err) {
    // Table might not exist yet
    res.json([])
  }
})

export default router
