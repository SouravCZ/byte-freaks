import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { pool } from '../db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CSV_DEFAULT = process.env.USERPROFILE
  ? join(process.env.USERPROFILE, 'Downloads', 'new_states_mock_data.csv')
  : join(__dirname, 'new_states_mock_data.csv')
const CSV_PATH = process.argv[2] || CSV_DEFAULT

const STATUS_MAP = {
  Proposed: 'planned',
  'Under Scrutiny': 'active',
  'Preliminary Notification Issued': 'active',
  'Declaration Issued': 'active',
  'Award Passed': 'active',
  'Possession Taken': 'active',
  'Compensation Disbursed': 'active',
  Closed: 'completed',
}

const RISK_BANDS = {
  Critical: { base: 90, min: 80, max: 100 },
  High: { base: 75, min: 60, max: 89 },
  Medium: { base: 55, min: 40, max: 74 },
  Low: { base: 30, min: 0, max: 44 },
}

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += ch
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field); field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.length > 1 || row[0]) rows.push(row)
      row = []
    } else {
      field += ch
    }
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function num(v) {
  if (v == null) return 0
  const n = parseFloat(String(v).trim())
  return Number.isFinite(n) ? n : 0
}

function int(v) {
  return Math.round(num(v))
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))

function computeRiskScore(category, prob) {
  const band = RISK_BANDS[category] || RISK_BANDS.Medium
  const score = band.base + (prob - 0.5) * 40
  return Math.round(clamp(score, band.min, band.max))
}

async function main() {
  const text = readFileSync(CSV_PATH, 'utf8')
  const rows = parseCsv(text)
  if (rows.length < 2) {
    console.error('CSV appears empty or header-only')
    process.exit(1)
  }

  const header = rows[0]
  const data = rows.slice(1)
  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]))

  const collate = (r, name) => (idx[name] != null ? (r[idx[name]] || '').trim() : '')

  console.log(`Loading ${data.length} records from ${CSV_PATH}`)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Wipe dependent data first, then blocks + projects
    await client.query('TRUNCATE alerts, risk_history, risk_drivers, projects, blocks RESTART IDENTITY CASCADE')

    // Insert blocks keyed by district (name = district, district = state)
    const blockId = new Map()
    const blockRows = []
    for (const r of data) {
      const district = collate(r, 'district')
      const state = collate(r, 'state')
      if (!district || blockId.has(district)) continue
      blockId.set(district, blockRows.length + 1)
      blockRows.push([district, state])
    }
    for (const [name, district] of blockRows) {
      await client.query(
        `INSERT INTO blocks (name, district, mouza_count, risk_score)
         VALUES ($1, $2, 0, 0)
         ON CONFLICT (name) DO UPDATE SET district = EXCLUDED.district`,
        [name, district]
      )
      const { rows: br } = await client.query('SELECT id FROM blocks WHERE name = $1', [name])
      blockId.set(name, br[0].id)
    }
    console.log(`  blocks: ${blockRows.length}`)

    let inserted = 0
    const projectIds = new Map()
    for (const r of data) {
      const code = collate(r, 'case_id')
      const name = collate(r, 'project_name')
      if (!code) continue

      const district = collate(r, 'district')
      const projectType = collate(r, 'project_type') || 'Infrastructure'
      const csvStatus = collate(r, 'status')
      const status = STATUS_MAP[csvStatus] || 'active'
      const riskCategory = collate(r, 'risk_category') || 'Medium'
      const delayProb = num(collate(r, 'delay_probability'))
      const riskScore = computeRiskScore(riskCategory, delayProb)
      const delayDays = int(collate(r, 'delay_days'))
      const leadTime = int(collate(r, 'actual_total_duration_days'))
      const families = int(collate(r, 'affected_families'))
      const startDate = collate(r, 'start_date') || null
      const lat = num(collate(r, 'latitude')) || null
      const lng = num(collate(r, 'longitude')) || null

      const { rows: insRows } = await client.query(
        `INSERT INTO projects
          (code, name, block_id, project_type, status, risk_score, delay_days, lead_time_days, mouzas_affected, start_date, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          code,
          name,
          blockId.get(district) || null,
          projectType,
          status,
          riskScore,
          delayDays,
          leadTime,
          families,
          startDate,
          lat,
          lng,
        ]
      )
      projectIds.set(code, insRows[0].id)
      inserted++
    }
    console.log(`  projects: ${inserted}`)

    // Risk drivers derived from CSV attributes (SHAP-style attribution)
    let drivers = 0
    for (const r of data) {
      const code = collate(r, 'case_id')
      const pid = projectIds.get(code)
      if (!pid) continue
      const factors = []
      const push = (label, pct) => { if (pct > 0) factors.push([label, Math.min(pct, 100)]) }

      push('Approval Turnaround', num(collate(r, 'avg_approval_turnaround_days')))
      push('Legal Dispute Burden', num(collate(r, 'dispute_duration_days')) / 3.5)
      push('Documentation Gaps', 100 - num(collate(r, 'stakeholder_responsiveness_score')))
      push('Pending Approvals', num(collate(r, 'pending_approvals_count')) * 20)
      push('R&R Outstanding', 100 - num(collate(r, 'rr_progress_percent')))

      factors.sort((a, b) => b[1] - a[1])
      const top = factors.slice(0, 3)
      for (let i = 0; i < top.length; i++) {
        const [factor, impact] = top[i]
        await client.query(
          'INSERT INTO risk_drivers (project_id, factor, impact_pct, rank) VALUES ($1, $2, $3, $4)',
          [pid, factor, Math.round(impact), i + 1]
        )
        drivers++
      }
    }
    console.log(`  risk_drivers: ${drivers}`)

    // Risk history snapshots (12 months) for trend charts
    let history = 0
    for (const r of data) {
      const pid = projectIds.get(collate(r, 'case_id'))
      if (!pid) continue
      const riskScore = computeRiskScore(collate(r, 'risk_category') || 'Medium', num(collate(r, 'delay_probability')))
      for (let m = 11; m >= 0; m--) {
        const jitter = Math.round((Math.random() - 0.5) * 14)
        await client.query(
          `INSERT INTO risk_history (project_id, risk_score, recorded_on)
           VALUES ($1, $2, CURRENT_DATE - ($3 || ' months')::interval)`,
          [pid, clamp(riskScore + jitter, 5, 100), m]
        )
        history++
      }
    }
    console.log(`  risk_history: ${history}`)

    // Roll up block risk from member projects (avg risk, mouza count from families)
    await client.query(`
      UPDATE blocks b SET
        risk_score = COALESCE((SELECT AVG(p.risk_score) FROM projects p WHERE p.block_id = b.id), 0),
        mouza_count = COALESCE((SELECT SUM(p.mouzas_affected) FROM projects p WHERE p.block_id = b.id), 0)
    `)

    // Derive alerts for high-risk (risk_score >= 75) projects
    const { rows: highRisk } = await client.query(
      "SELECT p.id, p.code, p.name FROM projects p WHERE p.risk_score >= 75 ORDER BY p.risk_score DESC LIMIT 5"
    )
    const sevFor = (score) => (score >= 90 ? 'critical' : score >= 80 ? 'high' : 'moderate')
    for (const p of highRisk) {
      await client.query(
        `INSERT INTO alerts (project_id, severity, title, message)
         VALUES ($1, $2, $3, $4)`,
        [
          p.id,
          sevFor(p.risk_score),
          `Delay Risk: ${p.name}`,
          `High delay-risk project (district-tracked). ${p.code} flagged for review.`,
        ]
      )
    }
    console.log(`  alerts: ${highRisk.length}`)

    // Synthetic risk history for trend charts (12 months) for top projects
    for (const p of highRisk.slice(0, 3)) {
      for (let m = 11; m >= 0; m--) {
        const base = p.risk_score
        const jitter = Math.round((Math.random() - 0.5) * 16)
        await client.query(
          `INSERT INTO risk_history (project_id, risk_score, recorded_on)
           VALUES ($1, $2, CURRENT_DATE - ($3 || ' months')::interval)`,
          [p.id, clamp(base + jitter, 10, 100), m]
        )
      }
    }

    await client.query('COMMIT')

    const totals = await Promise.all([
      client.query('SELECT count(*)::int AS c FROM projects'),
      client.query('SELECT count(*)::int AS c FROM blocks'),
      client.query('SELECT count(*)::int AS c FROM alerts'),
    ])
    console.log('DONE')
    console.log(`  total projects: ${totals[0].rows[0].c}`)
    console.log(`  total blocks (districts): ${totals[1].rows[0].c}`)
    console.log(`  total alerts: ${totals[2].rows[0].c}`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Import failed, rolled back:', err.message)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
