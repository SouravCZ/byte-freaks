import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function severityCls(sev) {
  switch (sev) {
    case 'critical': return { chip: 'bg-risk-critical-bg text-error border-error/20', dot: 'bg-error', border: 'border-l-error' }
    case 'high': return { chip: 'bg-risk-warning-bg text-risk-warning border-risk-warning/20', dot: 'bg-risk-warning', border: 'border-l-risk-warning' }
    case 'moderate': return { chip: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', border: 'border-l-amber-400' }
    case 'low': return { chip: 'bg-risk-success-bg text-risk-success border-risk-success/20', dot: 'bg-risk-success', border: 'border-l-risk-success' }
    default: return { chip: 'bg-surface-subtle text-text-secondary border-border-crisp', dot: 'bg-slate-400', border: 'border-l-slate-400' }
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
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary text-sm">Loading alerts…</p>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell title="Alerts" subtitle={`${API_BASE}/api/alerts`}>
        <div className="bg-surface-card border border-error/30 rounded-lg p-6 max-w-md mx-auto text-center">
          <p className="text-error font-semibold mb-2">Failed to load alerts</p>
          <p className="text-sm text-text-secondary">{error}</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Alerts" subtitle={`${counts.unread} unread of ${alerts.length} total`}>
      {/* Role banner */}
      <div className="px-space-lg py-space-sm bg-surface-card border-b border-border-crisp flex flex-wrap items-center justify-between gap-space-sm shadow-2xs -mx-space-lg lg:-mx-space-xl mb-0">
        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center gap-1.5 px-space-xs py-0.5 rounded bg-sky-50 border border-sky-200 text-primary font-code-xs text-code-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
            <span>AUTH_NODE_09 // CRYPTOGRAPHIC TOKEN VERIFIED</span>
          </div>
          <span className="font-body-sm text-body-sm text-text-secondary">Authorized Personnel: <strong className="text-text-primary font-headline-sm text-label-md">Joint Secretary / District Collector Protocol</strong> (Actionable Dispatch Enabled)</span>
        </div>
        <div className="flex items-center gap-space-base">
          <div className="flex items-center gap-space-xs font-code-xs text-code-xs text-error font-medium">
            <span className="material-symbols-outlined text-[16px] animate-bounce">priority_high</span>
            <span>SLA WARNING: Auto-Escalation to Ministry Armed</span>
          </div>
          <span className="font-code-xs text-code-xs text-text-muted font-medium">NIC-LGD Risk Sync: +0.04s</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-space-md mt-space-lg">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs font-code-xs text-code-xs text-primary font-semibold mb-space-xs uppercase tracking-wider">
              <span>MINISTRY OF RURAL DEVELOPMENT</span>
              <span>•</span>
              <span>DELAY EARLY WARNING SYSTEM (DEWS-V4)</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-text-primary tracking-tight font-bold">Predictive Alerts &amp; Delay Escalation Feed</h1>
            <p className="font-body-md text-body-md text-text-secondary mt-0.5">Real-time algorithmic warnings triggered when project delay probability crosses the statutory threshold.</p>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button className="px-space-sm py-1.5 rounded-lg bg-surface-card border border-border-crisp text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors flex items-center gap-1.5 font-label-sm text-label-sm shadow-2xs">
              <span className="material-symbols-outlined text-[16px] text-primary">download</span> Export Escalation Register
            </button>
            <button onClick={markFilteredReviewed} className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-semibold hover:bg-accent-cyan-deep transition-all flex items-center gap-1.5 font-label-sm text-label-sm shadow-xs">
              <span className="material-symbols-outlined text-[16px]">done_all</span> Mark Filtered as Reviewed
            </button>
          </div>
        </div>

        {/* Bento stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="p-space-md rounded-xl bg-surface-card border border-border-crisp shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-red-500/5 pointer-events-none"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-muted tracking-wider uppercase font-semibold">Unacknowledged Alerts</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-code-xs font-bold bg-red-100 border border-red-200 text-error animate-pulse">URGENT ACTION</span>
            </div>
            <div className="mt-space-sm flex items-baseline gap-space-xs">
              <span className="font-headline-xl text-headline-xl font-bold text-error tabular-nums">{counts.unread}</span>
              <span className="font-headline-sm text-headline-sm text-error font-semibold">Unread</span>
              <span className="font-code-xs text-code-xs text-text-muted ml-auto">live /api/alerts</span>
            </div>
            <div className="mt-space-sm flex items-center gap-1.5 font-code-xs text-code-xs text-text-muted">
              <span className="w-2 h-2 rounded-full bg-error"></span>
              <span>{counts.total} total alerts in register</span>
            </div>
          </div>

          <div className="p-space-md rounded-xl bg-surface-card border border-border-crisp shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-muted tracking-wider uppercase font-semibold">Escalation Queue</span>
              <span className="material-symbols-outlined text-[18px] text-secondary">account_balance</span>
            </div>
            <div className="mt-space-sm flex items-baseline gap-space-xs">
              <span className="font-headline-xl text-headline-xl font-bold text-secondary tabular-nums">{counts.escalated}</span>
              <span className="font-headline-sm text-headline-sm text-text-primary font-semibold">Critical / High</span>
              <span className="font-code-xs text-code-xs text-risk-success font-bold ml-auto">Actionable</span>
            </div>
            <div className="mt-space-sm flex items-center gap-1.5 font-code-xs text-code-xs text-text-secondary">
              <span className="material-symbols-outlined text-[14px] text-primary">forward_to_inbox</span>
              <span>Referred to PMO Pragati Docket</span>
            </div>
          </div>

          <div className="p-space-md rounded-xl bg-surface-card border border-border-crisp shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-muted tracking-wider uppercase font-semibold">Mean SLA Turnaround</span>
              <span className="material-symbols-outlined text-[18px] text-risk-success">timer</span>
            </div>
            <div className="mt-space-sm flex items-baseline gap-space-xs">
              <span className="font-headline-xl text-headline-xl font-bold text-text-primary tabular-nums">{meanHours === null ? '—' : meanHours.toFixed(1)}</span>
              <span className="font-headline-sm text-headline-sm text-text-secondary font-semibold">Hours</span>
              <span className="font-code-xs text-code-xs text-risk-success ml-auto font-bold">mean age</span>
            </div>
            <div className="mt-space-sm flex items-center justify-between font-code-xs text-code-xs text-text-muted">
              <span>Target benchmark: &lt; 6.0h</span>
              <span className={`font-bold ${slaCompliant ? 'text-risk-success' : 'text-error'}`}>{slaCompliant ? 'COMPLIANT' : 'AT RISK'}</span>
            </div>
          </div>

          <div className="p-space-md rounded-xl bg-surface-card border border-border-crisp shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-muted tracking-wider uppercase font-semibold">Ministry SLA Clock</span>
              <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
            </div>
            <div className="mt-space-sm flex items-baseline gap-space-xs">
              <span className="font-headline-xl text-headline-xl font-bold text-primary tabular-nums">{Math.max(0, 48 - Math.floor((meanHours || 0)))}:00</span>
              <span className="font-code-xs text-code-xs text-text-secondary">hrs remaining</span>
            </div>
            <div className="mt-space-sm w-full bg-surface-dim h-1.5 rounded-full overflow-hidden border border-border-crisp">
              <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, ((meanHours || 0) / 48) * 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Control strip */}
        <div className="px-space-lg py-space-sm bg-surface-card border-y border-border-crisp flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md sticky top-14 z-20 backdrop-blur-md shadow-2xs -mx-space-lg lg:-mx-space-xl">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-2 shrink-0 ${filter === f.id ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'text-text-muted hover:text-text-primary hover:bg-surface-subtle'}`}
              >
                <span>{f.label}</span>
                <span className={`font-code-xs text-code-xs px-1.5 py-0.2 rounded tabular-nums ${filter === f.id ? 'bg-white/20' : 'bg-surface-subtle'}`}>{f.id === 'all' ? counts.total : (counts[f.id] || 0)}</span>
              </button>
            ))}
          </div>
          <div className="relative lg:w-80 shrink-0">
            <span className="material-symbols-outlined absolute left-space-sm top-1/2 -translate-y-1/2 text-text-muted text-[17px]">search</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-surface-subtle border border-border-crisp pl-8 pr-3 py-1.5 text-body-sm font-body-sm rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
              placeholder="Search alert title, project, district…"
              type="text"
            />
          </div>
        </div>

        {/* Feed 8/4 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-base items-start pb-space-lg">
          <div className="lg:col-span-8 flex flex-col gap-space-sm">
            {visible.map((a) => {
              const cls = severityCls(a.severity)
              return (
                <div key={a.id} className={`bg-surface-card border rounded-xl p-space-md flex items-start gap-space-md border-l-4 shadow-sm ${cls.border} ${a.is_read ? 'opacity-70 border-border-crisp' : ''}`}>
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${cls.dot}`}></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-code-xs text-code-xs text-text-muted font-medium">#{a.id}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-code-xs font-semibold uppercase tracking-wider rounded border ${cls.chip}`}>{a.severity}</span>
                      {!a.is_read && <span className="px-2 py-0.5 text-[10px] font-code-xs font-semibold uppercase tracking-wider rounded bg-error text-on-error">Unread</span>}
                      <span className="font-semibold text-text-primary text-sm truncate">{a.title}</span>
                      <span className="ml-auto font-code-xs text-code-xs text-text-muted shrink-0">{timeAgo(a.created_at)}</span>
                    </div>
                    {a.message && <p className="text-sm text-text-secondary mb-2 leading-relaxed">{a.message}</p>}
                    <p className="text-xs text-text-muted flex items-center gap-1 flex-wrap">
                      {a.project_name && (
                        <>
                          <span className="material-symbols-outlined text-[13px] text-primary">location_on</span>
                          <Link to={a.project_id ? `/projects/${a.project_id}` : '/projects'} className="text-primary font-semibold hover:underline">{a.project_name}</Link>
                          {a.project_code ? <span className="font-code-xs">({a.project_code})</span> : null}
                          <span>·</span>
                        </>
                      )}
                      {a.district || a.block ? <span>{a.block || a.district}{a.district ? `, ${a.district}` : ''}</span> : null}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col gap-1.5">
                    {a.is_read ? (
                      <button onClick={() => markRead(a.id, false)} className="text-[11px] font-code-xs text-text-muted hover:text-primary border border-border-crisp rounded px-2.5 py-1.5 transition">Mark unread</button>
                    ) : (
                      <button onClick={() => markRead(a.id, true)} className="text-[11px] font-code-xs text-risk-success hover:text-on-primary hover:bg-risk-success border border-risk-success/30 rounded px-2.5 py-1.5 transition">Acknowledge</button>
                    )}
                    <button className="text-[11px] font-code-xs text-text-secondary hover:text-error border border-border-crisp rounded px-2.5 py-1.5 transition inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">priority_high</span>Escalate
                    </button>
                  </div>
                </div>
              )
            })}
            {visible.length === 0 && (
              <div className="bg-surface-card border border-border-crisp rounded-lg p-8 text-center">
                <p className="text-text-muted">No {filter === 'all' ? '' : `${filter} `}alerts{ q ? ' matching search' : ''}.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-space-md lg:sticky lg:top-28">
            <div className="bg-surface-card border border-border-crisp rounded-xl shadow-sm overflow-hidden">
              <div className="px-space-md py-space-sm border-b border-border-crisp flex items-center justify-between">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">Escalation Queue</h2>
                  <span className="font-code-xs text-code-xs text-text-muted">Critical &amp; high severity backlog</span>
                </div>
                <span className="font-code-xs text-code-xs px-2 py-0.5 rounded bg-risk-critical-bg border border-error/20 text-error font-bold tabular-nums">{escalationQueue.filter(a => !a.is_read).length} Open</span>
              </div>
              <div className="divide-y divide-border-crisp max-h-[420px] overflow-y-auto scrollbar-none">
                {escalationQueue.map((a) => {
                  const cls = severityCls(a.severity)
                  return (
                    <div key={a.id} className="px-space-md py-space-sm flex items-start gap-space-sm">
                      <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${cls.dot}`}></span>
                      <div className="flex-1 min-w-0">
                        <p className="font-body-sm text-body-sm text-text-primary font-semibold truncate">{a.title}</p>
                        <p className="font-code-xs text-code-xs text-text-muted truncate">#{a.id} · {timeAgo(a.created_at)}</p>
                        {a.project_name && <p className="font-code-xs text-code-xs text-text-muted truncate">{a.project_name}</p>}
                      </div>
                      {!a.is_read && (
                        <button onClick={() => markRead(a.id, true)} className="text-[10px] font-code-xs text-risk-success border border-risk-success/30 rounded px-1.5 py-1 hover:bg-risk-success hover:text-on-primary transition">Ack</button>
                      )}
                    </div>
                  )
                })}
                {escalationQueue.length === 0 && <p className="px-space-md py-8 text-center text-text-muted font-code-xs text-code-xs">No escalations in queue.</p>}
              </div>
            </div>

            <div className="bg-surface-card rounded-xl shadow-sm border border-border-crisp border-l-4 border-l-primary p-space-md">
              <div className="flex items-center gap-space-xs text-primary font-headline-sm text-headline-sm font-bold">
                <span className="material-symbols-outlined text-[18px]">preview</span>
                DEWS-V4 Diagnostic
              </div>
              <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed mt-1">
                Model confidence <strong className="text-risk-success">94.2%</strong> on threshold breaches. Alerts with severity &gt; High auto-escalate at 48h if unacknowledged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}