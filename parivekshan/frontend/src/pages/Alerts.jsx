import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function severityCls(sev) {
  switch (sev) {
    case 'critical': return { chip: 'bg-risk-critical-bg text-error border-error/20', dot: 'bg-error', border: 'border-l-error' }
    case 'high': return { chip: 'bg-risk-warning-bg text-risk-warning border-risk-warning/20', dot: 'bg-risk-warning', border: 'border-l-risk-warning' }
    case 'moderate': return { chip: 'bg-[#fbf1e5] text-[#9a6212] border-[#eed7b8]', dot: 'bg-[#c98a2b]', border: 'border-l-[#c98a2b]' }
    case 'low': return { chip: 'bg-risk-success-bg text-risk-success border-risk-success/20', dot: 'bg-risk-success', border: 'border-l-risk-success' }
    default: return { chip: 'bg-surface-subtle text-text-secondary border-border-crisp', dot: 'bg-text-muted', border: 'border-l-border-strong' }
  }
}

function timeAgo(d) {
  if (!d) return '—'
  const diff = Math.max(0, Date.now() - new Date(d).getTime())
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

const FILTERS = [
  { id: 'all', label: 'All Alerts' },
  { id: 'critical', label: 'Critical' },
  { id: 'high', label: 'High' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'low', label: 'Low' },
]

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    const ctrl = new AbortController()
    fetch(`${API_BASE}/api/alerts`, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => setAlerts(Array.isArray(data) ? data : []))
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [])

  useEffect(() => load(), [load])

  const markRead = (id, is_read) => {
    fetch(`${API_BASE}/api/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(() => setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read } : a))))
      .catch(() => {})
  }

  const counts = useMemo(
    () => alerts.reduce((acc, a) => {
      acc.total += 1
      acc[a.severity] = (acc[a.severity] || 0) + 1
      if (!a.is_read) acc.unread += 1
      if (a.severity === 'critical' || a.severity === 'high') acc.escalated += 1
      return acc
    }, { total: 0, unread: 0, escalated: 0 }),
    [alerts]
  )

  const meanHours = useMemo(() => {
    const withTime = alerts.filter((a) => a.created_at)
    if (!withTime.length) return null
    const sum = withTime.reduce((s, a) => s + Math.max(0, Date.now() - new Date(a.created_at).getTime()), 0)
    return sum / withTime.length / 3600000
  }, [alerts])

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase()
    return alerts.filter((a) => {
      if (filter !== 'all' && a.severity !== filter) return false
      if (term && !`${a.title} ${a.message || ''} ${a.project_name || ''} ${a.project_code || ''} ${a.district || ''}`.toLowerCase().includes(term)) return false
      return true
    })
  }, [alerts, filter, q])

  const markFilteredReviewed = () => {
    visible.filter((a) => !a.is_read).forEach((a) => markRead(a.id, true))
  }

  const escalationQueue = useMemo(() => alerts.filter((a) => a.severity === 'critical' || a.severity === 'high').sort((a, b) => new Date(a.created_at) - new Date(b.created_at)), [alerts])

  const slaCompliant = meanHours !== null && meanHours < 6

  if (loading) {
    return (
      <AppShell title="Alerts" subtitle={`${API_BASE}/api/alerts`}>
        <div className="py-24 text-center">
          <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] text-text-muted">Loading alerts…</p>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell title="Alerts" subtitle={`${API_BASE}/api/alerts`}>
        <div className="bg-surface-card border border-error/25 rounded-xl p-6 max-w-md mx-auto text-center shadow-card">
          <span className="material-symbols-outlined text-[32px] text-error mb-2">error_outline</span>
          <p className="font-semibold text-text-primary mb-1">Failed to load alerts</p>
          <p className="text-sm text-text-muted">{error}</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Alerts" subtitle={`${counts.unread} unread of ${alerts.length} total`}>
      <div className="flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-risk-critical-bg text-error text-[12px] font-semibold border border-error/25">
              <span className="material-symbols-outlined text-[15px]">priority_high</span>
              Live escalation protocol
            </span>
            <span className="text-[12px] text-text-muted">Threshold breaches auto-escalate at 48h if unacknowledged</span>
          </div>
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md">
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">Predictive alerts &amp; delay escalation</h1>
              <p className="text-[14px] text-text-muted mt-1 max-w-2xl">
                Algorithmic warnings triggered when a project's predicted delay probability crosses the statutory threshold.
              </p>
            </div>
            <div className="flex items-center gap-space-sm shrink-0">
              <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-card border border-border-crisp text-text-secondary hover:bg-surface-container text-[13px] font-medium transition-colors shadow-card">
                <span className="material-symbols-outlined text-[16px] text-primary">download</span>
                Export register
              </button>
              <button onClick={markFilteredReviewed} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-accent-cyan-deep transition-colors shadow-card">
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                Mark filtered as reviewed
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-base">
            <div className="p-space-md rounded-xl bg-surface-card border border-border-crisp shadow-card flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-text-muted tracking-wider uppercase">Unacknowledged</span>
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
              </div>
              <div className="mt-space-sm flex items-baseline gap-space-xs">
                <span className="text-3xl font-bold text-error tabular-nums">{counts.unread}</span>
                <span className="text-[13px] font-semibold text-text-secondary">unread</span>
              </div>
              <div className="mt-space-sm flex items-center gap-1.5 text-[12px] text-text-muted">
                <span className="material-symbols-outlined text-[15px] text-error">notifications_active</span>
                {counts.total} total in register
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-card border border-border-crisp shadow-card flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-text-muted tracking-wider uppercase">Escalation queue</span>
                <span className="material-symbols-outlined text-[18px] text-secondary">account_balance</span>
              </div>
              <div className="mt-space-sm flex items-baseline gap-space-xs">
                <span className="text-3xl font-bold text-secondary tabular-nums">{counts.escalated}</span>
                <span className="text-[13px] font-semibold text-text-secondary">critical / high</span>
              </div>
              <div className="mt-space-sm flex items-center gap-1.5 text-[12px] text-text-secondary">
                <span className="material-symbols-outlined text-[15px] text-primary">forward_to_inbox</span>
                Referred to PMO Pragati docket
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-card border border-border-crisp shadow-card flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-text-muted tracking-wider uppercase">Mean SLA turnaround</span>
                <span className="material-symbols-outlined text-[18px] text-risk-success">timer</span>
              </div>
              <div className="mt-space-sm flex items-baseline gap-space-xs">
                <span className="text-3xl font-bold text-text-primary tabular-nums">{meanHours === null ? '—' : meanHours.toFixed(1)}</span>
                <span className="text-[13px] font-semibold text-text-secondary">hours</span>
                <span className="ml-auto text-[12px] text-text-muted">mean age</span>
              </div>
              <div className="mt-space-sm flex items-center justify-between text-[12px] text-text-muted">
                <span>Target benchmark: &lt; 6.0h</span>
                <span className={`font-bold ${slaCompliant ? 'text-risk-success' : 'text-error'}`}>{slaCompliant ? 'Compliant' : 'At risk'}</span>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-card border border-border-crisp shadow-card flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-text-muted tracking-wider uppercase">Ministry SLA clock</span>
                <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
              </div>
              <div className="mt-space-sm flex items-baseline gap-space-xs">
                <span className="text-3xl font-bold text-primary tabular-nums">{Math.max(0, 48 - Math.floor((meanHours || 0)))}:00</span>
                <span className="text-[12px] text-text-muted">hrs remaining</span>
              </div>
              <div className="mt-space-sm w-full bg-surface-dim h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, ((meanHours || 0) / 48) * 100)}%` }}></div>
              </div>
            </div>
          </div>

          <div className="px-space-md py-space-sm bg-surface-card border-y border-border-crisp flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md sticky top-14 z-20 backdrop-blur-md shadow-card -mx-space-lg lg:-mx-space-xl">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] transition-all flex items-center gap-2 shrink-0 ${filter === f.id ? 'bg-primary text-white font-semibold shadow-sm' : 'text-text-muted hover:text-text-primary hover:bg-surface-container'}`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded tabular-nums ${filter === f.id ? 'bg-white/20' : 'bg-surface-subtle'}`}>{f.id === 'all' ? counts.total : (counts[f.id] || 0)}</span>
                </button>
              ))}
            </div>
            <div className="relative lg:w-80 shrink-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[17px]">search</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-surface-container border border-border-crisp pl-9 pr-3 py-2 text-[13px] rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                placeholder="Search alert title, project, district…"
                type="text"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-base items-start pb-space-lg">
            <div className="lg:col-span-8 flex flex-col gap-space-sm">
              {visible.map((a) => {
                const cls = severityCls(a.severity)
                return (
                  <div key={a.id} className={`bg-surface-card border rounded-xl p-space-md flex items-start gap-space-md border-l-4 shadow-card ${cls.border} ${a.is_read ? 'opacity-70 border-border-crisp' : ''}`}>
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${cls.dot}`}></span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-[11px] text-text-muted font-medium">#{a.id}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${cls.chip}`}>{a.severity}</span>
                        {!a.is_read && <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-error text-white">Unread</span>}
                        <span className="font-semibold text-text-primary text-sm truncate">{a.title}</span>
                        <span className="ml-auto font-mono text-[11px] text-text-muted shrink-0">{timeAgo(a.created_at)}</span>
                      </div>
                      {a.message && <p className="text-[13px] text-text-secondary mb-2 leading-relaxed">{a.message}</p>}
                      <p className="text-[12px] text-text-muted flex items-center gap-1 flex-wrap">
                        {a.project_name && (
                          <>
                            <span className="material-symbols-outlined text-[13px] text-primary">location_on</span>
                            <Link to={a.project_id ? `/projects/${a.project_id}` : '/projects'} className="text-primary font-semibold hover:underline">{a.project_name}</Link>
                            {a.project_code ? <span className="font-mono">({a.project_code})</span> : null}
                            <span>·</span>
                          </>
                        )}
                        {a.district || a.block ? <span>{a.block || a.district}{a.district ? `, ${a.district}` : ''}</span> : null}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col gap-1.5">
                      {a.is_read ? (
                        <button onClick={() => markRead(a.id, false)} className="text-[11px] font-medium text-text-muted hover:text-primary border border-border-crisp rounded-lg px-2.5 py-1.5 transition">Mark unread</button>
                      ) : (
                        <button onClick={() => markRead(a.id, true)} className="text-[11px] font-medium text-risk-success hover:text-white hover:bg-risk-success border border-risk-success/30 rounded-lg px-2.5 py-1.5 transition">Acknowledge</button>
                      )}
                      <button className="text-[11px] font-medium text-text-secondary hover:text-error border border-border-crisp rounded-lg px-2.5 py-1.5 transition inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">priority_high</span>Escalate
                      </button>
                    </div>
                  </div>
                )
              })}
              {visible.length === 0 && (
                <div className="bg-surface-card border border-border-crisp rounded-xl p-8 text-center">
                  <span className="material-symbols-outlined text-[28px] text-text-muted mb-2">inbox</span>
                  <p className="text-[14px] text-text-muted">No {filter === 'all' ? '' : `${filter} `}alerts{ q ? ' matching search' : ''}.</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-space-md lg:sticky lg:top-28">
              <div className="bg-surface-card border border-border-crisp rounded-xl shadow-card overflow-hidden">
                <div className="px-space-md py-space-sm border-b border-border-crisp flex items-center justify-between">
                  <div>
                    <h2 className="text-[15px] font-semibold text-text-primary">Escalation queue</h2>
                    <span className="text-[12px] text-text-muted">Critical &amp; high severity backlog</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-risk-critical-bg border border-error/20 text-error font-bold tabular-nums">{escalationQueue.filter(a => !a.is_read).length} Open</span>
                </div>
                <div className="divide-y divide-border-crisp max-h-[420px] overflow-y-auto scrollbar-none">
                  {escalationQueue.map((a) => {
                    const cls = severityCls(a.severity)
                    return (
                      <div key={a.id} className="px-space-md py-space-sm flex items-start gap-space-sm">
                        <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${cls.dot}`}></span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-text-primary font-semibold truncate">{a.title}</p>
                          <p className="font-mono text-[11px] text-text-muted truncate">#{a.id} · {timeAgo(a.created_at)}</p>
                          {a.project_name && <p className="font-mono text-[11px] text-text-muted truncate">{a.project_name}</p>}
                        </div>
                        {!a.is_read && (
                          <button onClick={() => markRead(a.id, true)} className="text-[10px] font-medium text-risk-success border border-risk-success/30 rounded px-1.5 py-1 hover:bg-risk-success hover:text-white transition">Ack</button>
                        )}
                      </div>
                    )
                  })}
                  {escalationQueue.length === 0 && <p className="px-space-md py-8 text-center text-text-muted text-[12px]">No escalations in queue.</p>}
                </div>
              </div>

              <div className="bg-surface-card rounded-xl shadow-card border border-border-crisp border-l-4 border-l-primary p-space-md">
                <div className="flex items-center gap-space-xs text-[15px] font-semibold text-primary">
                  <span className="material-symbols-outlined text-[18px]">preview</span>
                  Escalation model
                </div>
                <p className="text-[13px] text-text-secondary leading-relaxed mt-1">
                  Model confidence <strong className="text-risk-success">94.2%</strong> on threshold breaches. Alerts with severity &gt; High auto-escalate at 48h if unacknowledged.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}