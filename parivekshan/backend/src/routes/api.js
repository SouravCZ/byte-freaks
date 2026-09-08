import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

// GET /api/health - DB connectivity health check
router.get('/health', async (_req, res) => {
  try {
    await query('SELECT 1')
    res.json({ status: 'ok', database: 'connected' })
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected', message: err.message })
  }
})

// GET /api/stats - aggregate dashboard KPIs
router.get('/stats', async (_req, res) => {
  try {
    const [projects, highRisk, blocks, alerts, parcels] = await Promise.all([
      query('SELECT count(*)::int AS total FROM projects'),
      query("SELECT count(*)::int AS total FROM projects WHERE risk_score >= 75"),
      query('SELECT count(*)::int AS total FROM blocks'),
      query("SELECT count(*)::int AS total FROM alerts WHERE NOT is_read"),
      query('SELECT COALESCE(sum(mouzas_affected), 0)::int AS total FROM projects'),
    ])

    res.json({
      totalProjects: projects.rows[0].total,
      highRiskProjects: highRisk.rows[0].total,
      totalBlocks: blocks.rows[0].total,
      unreadAlerts: alerts.rows[0].total,
      mouzasTracked: parcels.rows[0].total,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/projects - list projects (optional ?status= & ?block= filters)
router.get('/projects', async (req, res) => {
  const { status, block } = req.query
  const conditions = []
  const params = []

  if (status) {
    params.push(status)
    conditions.push(`p.status = $${params.length}`)
  }
  if (block) {
    params.push(block)
    conditions.push(`b.name = $${params.length}`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const text = `
    SELECT p.id, p.code, p.name, p.project_type, p.description,
           p.status, p.risk_score, p.delay_days, p.lead_time_days,
           p.mouzas_affected, p.start_date, p.target_date,
           b.name AS block, b.district
    FROM projects p
    LEFT JOIN blocks b ON b.id = p.block_id
    ${where}
    ORDER BY p.risk_score DESC
  `
  try {
    const { rows } = await query(text, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/projects/:id - single project with drivers + history
router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params
    const projectRows = await query(
      `SELECT p.id, p.code, p.name, p.project_type, p.description,
              p.status, p.risk_score, p.delay_days, p.lead_time_days,
              p.mouzas_affected, p.start_date, p.target_date, p.actual_date,
              b.name AS block, b.district
       FROM projects p
       LEFT JOIN blocks b ON b.id = p.block_id
       WHERE p.id = $1`,
      [id]
    )

    if (projectRows.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const [drivers, history, alerts] = await Promise.all([
      query('SELECT factor, impact_pct, rank FROM risk_drivers WHERE project_id = $1 ORDER BY rank NULLS LAST', [id]),
      query('SELECT recorded_on, risk_score FROM risk_history WHERE project_id = $1 ORDER BY recorded_on', [id]),
      query('SELECT id, severity, title, message, is_read, created_at FROM alerts WHERE project_id = $1 ORDER BY created_at DESC', [id]),
    ])

    res.json({ ...projectRows.rows[0], drivers: drivers.rows, history: history.rows, alerts: alerts.rows })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/projects - create a project
router.post('/projects', async (req, res) => {
  const { code, name, block, project_type, description, status, risk_score, delay_days, lead_time_days, mouzas_affected, start_date, target_date } = req.body

  if (!code || !name) {
    return res.status(400).json({ error: 'code and name are required' })
  }

  try {
    const blockRow = block
      ? await query('SELECT id FROM blocks WHERE name = $1', [block])
      : { rows: [] }

    const { rows } = await query(
      `INSERT INTO projects
        (code, name, block_id, project_type, description, status,
         risk_score, delay_days, lead_time_days, mouzas_affected, start_date, target_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, code, name, status, risk_score`,
      [
        code, name,
        blockRow.rows.length ? blockRow.rows[0].id : null,
        project_type || 'Infrastructure',
        description || null,
        status || 'active',
        risk_score || 0,
        delay_days || 0,
        lead_time_days || 0,
        mouzas_affected || 0,
        start_date || null,
        target_date || null,
      ]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/blocks - list all blocks
router.get('/blocks', async (_req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, district, mouza_count, risk_score FROM blocks ORDER BY risk_score DESC'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/alerts - list alerts (optional ?unread=true)
router.get('/alerts', async (req, res) => {
  const unreadOnly = req.query.unread === 'true'
  const text = `
    SELECT a.id, a.severity, a.title, a.message, a.is_read, a.created_at,
           COALESCE(p.name, 'General') AS project_name, p.code AS project_code
    FROM alerts a
    LEFT JOIN projects p ON p.id = a.project_id
    ${unreadOnly ? 'WHERE a.is_read = FALSE' : ''}
    ORDER BY a.created_at DESC
  `
  try {
    const { rows } = await query(text)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/alerts/:id - mark read/unread
router.patch('/alerts/:id', async (req, res) => {
  const { is_read } = req.body
  try {
    const { rows } = await query(
      'UPDATE alerts SET is_read = $2 WHERE id = $1 RETURNING id, is_read',
      [req.params.id, Boolean(is_read)]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Alert not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
