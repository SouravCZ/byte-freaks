import React, { useMemo, useState } from 'react'
import AppShell from '../components/layout/AppShell'

const SEEDED_USERS = [
  {
    id: 1, name: 'Dr. S. K. Verma, IAS', role: 'Ministry Admin', roleTier: 'Ministry Admin (Tier-1)',
    designation: 'Joint Secretary, MoRD (Land Resources)', email: 'sk.verma@gov.in', nicId: 'NIC-ID: DEL-IAS-1998-0442',
    state: 'National', cadence: 'National (All 766 Districts)', scope: 'Full Read/Write & Overrule',
    avatarBg: 'bg-sky-100 text-sky-900 border-sky-200', initials: 'SV', trust: 'e-Pramaan Active', trustIcon: 'fingerprint',
    lastActive: 'Active Now', lastActiveMeta: 'IP: 10.142.8.21 (GovNet)', status: 'Active',
  },
  {
    id: 2, name: 'Rajesh Deshmukh, IAS', role: 'District Authority',
    designation: 'District Collector & DM, Pune (CALA)', email: 'collector.pune@maharashtra.gov.in', nicId: 'NIC-ID: MH-IAS-2008-0119',
    state: 'Maharashtra', cadence: 'Pune & Satara Corridor', scope: 'Maharashtra Cadre • NH-48 Scope',
    avatarBg: 'bg-indigo-100 text-indigo-900 border-indigo-200', initials: 'RD', trust: 'NIC e-Pramaan Active', trustIcon: 'shield',
    lastActive: '14 mins ago', lastActiveMeta: 'Approved Khasra #842', status: 'Active',
  },
  {
    id: 3, name: 'Siddharth Swain, IAS', role: 'District Authority',
    designation: 'District Magistrate & Collector, Angul', email: 'dm.angul@odisha.gov.in', nicId: 'NIC-ID: OD-IAS-2011-0217',
    state: 'Odisha', cadence: 'Angul & Dhenkanal', scope: 'Odisha Cadre • Sukinda Corridor',
    avatarBg: 'bg-slate-100 text-slate-800 border-slate-200', initials: 'SS', trust: 'e-Pramaan Active', trustIcon: 'fingerprint',
    lastActive: '1 hr ago', lastActiveMeta: 'Cleared Sec 3D Award', status: 'Active',
  },
  {
    id: 4, name: 'Anil Trivedi, IAS', role: 'District Authority',
    designation: 'District Magistrate, Gautam Buddha Nagar', email: 'dm.gbnagar@up.gov.in', nicId: 'NIC-ID: UP-IAS-2014-0331',
    state: 'Uttar Pradesh', cadence: 'GB Nagar & Meerut', scope: 'UP Cadre • Jewar Corridor',
    avatarBg: 'bg-emerald-100 text-emerald-900 border-emerald-200', initials: 'AT', trust: 'NIC e-Pramaan Active', trustIcon: 'shield',
    lastActive: '3 hrs ago', lastActiveMeta: 'Gram Sabha minutes filed', status: 'Active',
  },
  {
    id: 5, name: 'Neha Kulkarni', role: 'Viewer',
    designation: 'Project Auditor, NITI Aayog', email: 'nehak@niti.gov.in', nicId: 'NIC-ID: NITI-2020-0103',
    state: 'Maharashtra', cadence: 'Read-Only Enclave', scope: 'Maharashtra portfolio',
    avatarBg: 'bg-teal-100 text-teal-900 border-teal-200', initials: 'NK', trust: 'e-Pramaan Verified', trustIcon: 'verified_user',
    lastActive: 'Yesterday', lastActiveMeta: 'Export: 42 pdfs', status: 'Active',
  },
  {
    id: 6, name: 'Priyanka Rao', role: 'Viewer',
    designation: 'Lead Auditor, CAG Cell', email: 'prao@cag.gov.in', nicId: 'NIC-ID: CAG-2016-0067',
    state: 'National', cadence: 'National View Only', scope: 'All states read access',
    avatarBg: 'bg-rose-100 text-rose-900 border-rose-200', initials: 'PR', trust: 'e-Pramaan Verified', trustIcon: 'verified_user',
    lastActive: '2 days ago', lastActiveMeta: 'No write access', status: 'Active',
  },
  {
    id: 7, name: 'Manish Prasad, IAS', role: 'Pending',
    designation: 'DM & Collector, Cuttack', email: 'dm.cuttack@odisha.gov.in', nicId: 'NIC-ID: OD-IAS-2022-0091',
    state: 'Odisha', cadence: 'Awaiting boundary bind', scope: 'NIC KYC documentary pending',
    avatarBg: 'bg-amber-100 text-amber-900 border-amber-200', initials: 'MP', trust: 'KYC Verifying', trustIcon: 'manage_search',
    lastActive: '—', lastActiveMeta: 'Docs: PAN, Gazette, NOC', status: 'Suspended',
  },
]

function roleCls(role) {
  switch (role) {
    case 'Ministry Admin': return { chip: 'bg-sky-50 text-primary border-sky-200 font-code-xs', dot: 'bg-sky-600', icon: 'travel_explore' }
    case 'District Authority': return { chip: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-code-xs', dot: 'bg-indigo-600', icon: 'share_location' }
    case 'Viewer': return { chip: 'bg-slate-100 text-slate-700 border-slate-200 font-code-xs', dot: 'bg-slate-500', icon: 'visibility' }
    default: return { chip: 'bg-red-50 text-error border-red-200 font-code-xs', dot: 'bg-red-600', icon: 'manage_search' }
  }
}

function statusPill(status) {
  return status === 'Active'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-code-xs'
    : 'bg-red-50 text-error border-red-200 font-code-xs'
}

export default function Users() {
  const [tab, setTab] = useState('All Users')
  const [q, setQ] = useState('')
  const [jurisdiction, setJurisdiction] = useState('National')
  const [status, setStatus] = useState('ALL')

  const counts = useMemo(() => {
    return SEEDED_USERS.reduce((acc, u) => {
      acc.all += 1
      acc[u.role] = (acc[u.role] || 0) + 1
      return acc
    }, { all: 0 })
  }, [])

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase()
    return SEEDED_USERS.filter((u) => {
      if (tab !== 'All Users' && u.role !== tab) return false
      if (jurisdiction === 'National' && u.state !== 'National') return false
      if (jurisdiction !== 'National' && u.state !== jurisdiction) return false
      if (status !== 'ALL' && u.status !== status) return false
      if (term && !`${u.name} ${u.email} ${u.designation} ${u.scope}`.toLowerCase().includes(term)) return false
      return true
    })
  }, [tab, q, jurisdiction, status])

  const TABS = [
    ['All Users', 'all'], ['Ministry Admin', 'admin'], ['District Authority', 'district'], ['Viewer', 'viewer'], ['Pending', 'pending'],
  ]

  return (
    <AppShell title="Users" subtitle="Identity, Role &amp; Scope Governance">
      {/* Top action & context banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md pb-space-xs">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg text-text-primary font-bold tracking-tight">Identity, Role &amp; Scope Governance</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-sky-50 text-primary border border-sky-200 font-code-xs text-code-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse"></span> RBAC v4.8 Active
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-risk-success-bg text-risk-success border border-risk-success/20 font-code-xs text-code-xs font-semibold">
              <span className="material-symbols-outlined text-[14px] text-tertiary">verified</span> e-Pramaan Tier-3 Enforced
            </span>
          </div>
          <p className="font-body-md text-body-md text-text-secondary max-w-4xl">
            Role-based access control (RBAC) across Ministry officials, District Collectors, and public auditors with strict spatial boundary enforcement.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="hidden sm:flex items-center gap-2 px-space-md py-2 rounded bg-surface-card border border-border-crisp text-text-secondary font-code-xs text-code-xs shadow-2xs">
            <span className="material-symbols-outlined text-[16px] text-risk-success">admin_panel_settings</span>
            <span className="text-text-primary font-bold">Joint Secy (Land Resources)</span>
            <span className="text-text-muted font-mono">#MoRD-DEL-01</span>
          </div>
          <button className="inline-flex items-center gap-1.5 px-space-md py-2 rounded bg-surface-card border border-border-crisp text-text-secondary hover:bg-surface-subtle text-xs font-semibold transition-colors shadow-2xs">
            <span className="material-symbols-outlined text-[16px] text-text-muted">history_edu</span> Audit Access Logs
          </button>
          <button className="inline-flex items-center gap-1.5 px-space-md py-2 rounded bg-surface-card border border-border-crisp text-text-secondary hover:bg-surface-subtle text-xs font-semibold transition-colors shadow-2xs">
            <span className="material-symbols-outlined text-[16px] text-text-muted">download</span> Export Matrix
          </button>
          <button className="inline-flex items-center gap-1.5 px-space-md py-2 rounded bg-primary text-on-primary hover:bg-accent-cyan-deep text-xs font-bold shadow-sm transition-all">
            <span className="material-symbols-outlined text-[18px]">person_add</span> + Add Authorized Official
          </button>
        </div>
      </div>

      {/* Quick stats bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mt-space-md">
        <div className="p-space-md rounded bg-surface-card border border-border-crisp flex flex-col justify-between relative overflow-hidden shadow-2xs">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
          <div className="flex items-center justify-between text-text-muted pl-2">
            <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-text-secondary">Total Registered Personnel</span>
            <span className="material-symbols-outlined text-[20px] text-primary">group</span>
          </div>
          <div className="mt-space-md flex items-baseline gap-2 pl-2">
            <span className="font-code-lg text-code-lg text-text-primary font-bold font-mono tabular-nums">{SEEDED_USERS.length}</span>
            <span className="font-code-xs text-code-xs text-risk-success flex items-center font-bold"><span className="material-symbols-outlined text-[14px]">north_east</span> seeded</span>
          </div>
          <div className="mt-space-xs flex items-center justify-between text-text-muted font-code-xs text-code-xs pl-2 pt-2 border-t border-border-crisp">
            <span>Reference Directory</span>
            <span className="text-risk-success font-semibold">sample rows</span>
          </div>
        </div>
        <div className="p-space-md rounded bg-surface-card border border-border-crisp flex flex-col justify-between relative overflow-hidden shadow-2xs">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>
          <div className="flex items-center justify-between text-text-muted pl-2">
            <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-text-secondary">District Authorities (DM/CALA)</span>
            <span className="material-symbols-outlined text-[20px] text-indigo-600">share_location</span>
          </div>
          <div className="mt-space-md flex items-baseline gap-2 pl-2">
            <span className="font-code-lg text-code-lg text-text-primary font-bold font-mono tabular-nums">{counts['District Authority'] || 0}</span>
            <span className="font-code-xs text-code-xs text-text-secondary font-medium">Active Collectors</span>
          </div>
          <div className="mt-space-xs flex items-center justify-between text-text-muted font-code-xs text-code-xs pl-2 pt-2 border-t border-border-crisp">
            <span>Geo-Fenced Jurisdictions</span>
            <span className="text-primary font-semibold">boundary-enforced</span>
          </div>
        </div>
        <div className="p-space-md rounded bg-surface-card border border-border-crisp flex flex-col justify-between relative overflow-hidden shadow-2xs">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary"></div>
          <div className="flex items-center justify-between text-text-muted pl-2">
            <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-text-secondary">Ministry Administrators</span>
            <span className="material-symbols-outlined text-[20px] text-tertiary">security</span>
          </div>
          <div className="mt-space-md flex items-baseline gap-2 pl-2">
            <span className="font-code-lg text-code-lg text-text-primary font-bold font-mono tabular-nums">{counts['Ministry Admin'] || 0}</span>
            <span className="font-code-xs text-code-xs text-primary font-semibold">National Scope</span>
          </div>
          <div className="mt-space-xs flex items-center justify-between text-text-muted font-code-xs text-code-xs pl-2 pt-2 border-t border-border-crisp">
            <span>MoRD • NHAI • PMGSY</span>
            <span className="text-risk-success font-semibold">MFA Enforced</span>
          </div>
        </div>
        <div className="p-space-md rounded bg-surface-card border border-border-crisp flex flex-col justify-between relative overflow-hidden shadow-2xs">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-500"></div>
          <div className="flex items-center justify-between text-text-muted pl-2">
            <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-text-secondary">Auditors &amp; Viewers</span>
            <span className="material-symbols-outlined text-[20px] text-slate-600">visibility</span>
          </div>
          <div className="mt-space-md flex items-baseline gap-2 pl-2">
            <span className="font-code-lg text-code-lg text-text-primary font-bold font-mono tabular-nums">{counts['Viewer'] || 0}</span>
            <span className="font-code-xs text-code-xs text-text-muted font-medium">Read-Only Enclave</span>
          </div>
          <div className="mt-space-xs flex items-center justify-between text-text-muted font-code-xs text-code-xs pl-2 pt-2 border-t border-border-crisp">
            <span>NITI • CAG Cell</span>
            <span className="font-medium">no write access</span>
          </div>
        </div>
      </div>

      {/* Filter ribbon */}
      <div className="p-space-md rounded bg-surface-card border border-border-crisp flex flex-col lg:flex-row lg:items-center justify-between gap-space-md shadow-2xs mt-space-md">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {TABS.map(([label, key]) => {
            const isPending = key === 'pending'
            const active = tab === label
            return (
              <button
                key={key}
                onClick={() => setTab(label)}
                className={`px-space-md py-1.5 rounded text-xs shrink-0 transition-all flex items-center gap-1 ${
                  active
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : isPending
                      ? 'font-bold text-error hover:bg-risk-critical-bg'
                      : 'font-medium text-text-secondary hover:text-text-primary hover:bg-surface-subtle'
                }`}
              >
                {isPending && <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>}
                {label}
                <span className={`ml-1 font-code-xs text-[10px] tabular-nums ${active ? 'opacity-90' : isPending ? '' : 'text-text-muted'}`}>
                  {(key === 'all' ? counts.all : (counts[label] || 0))}
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="relative flex-1 min-w-[240px] sm:min-w-[280px]">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-text-muted text-[18px]">search</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-surface-subtle border border-border-crisp pl-9 pr-3 py-1.5 rounded text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:bg-white focus:border-primary transition-all"
              placeholder="Search official, email, cadre, district…"
              type="text"
            />
          </div>
          <div className="relative">
            <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className="bg-surface-subtle border border-border-crisp text-text-primary text-xs font-medium py-1.5 pl-3 pr-8 rounded focus:outline-none focus:border-primary cursor-pointer appearance-none">
              <option value="National">Jurisdiction: National</option>
              {Array.from(new Set(SEEDED_USERS.map((u) => u.state).filter((s) => s !== 'National'))).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2 text-text-muted pointer-events-none text-[16px]">expand_more</span>
          </div>
          <div className="flex items-center rounded border border-border-crisp bg-surface-subtle p-0.5">
            {['ALL', 'Active', 'Suspended'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-2.5 py-1 rounded text-xs transition-all ${status === s ? 'bg-surface-card text-primary font-bold shadow-2xs border border-border-crisp' : 'text-text-secondary hover:text-text-primary font-medium'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded bg-surface-card border border-border-crisp shadow-sm overflow-hidden flex flex-col mt-space-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-subtle/90 border-b border-border-crisp text-text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-space-md">Official Name &amp; Designation</th>
                <th className="py-3 px-space-md">NIC Identity / e-Mail</th>
                <th className="py-3 px-space-md">Governance Role</th>
                <th className="py-3 px-space-md">Assigned Cadre &amp; Jurisdiction</th>
                <th className="py-3 px-space-md">MFA / Identity Trust</th>
                <th className="py-3 px-space-md">Last Active</th>
                <th className="py-3 px-space-md text-center">Status</th>
                <th className="py-3 px-space-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-crisp text-xs text-text-secondary bg-surface-card">
              {visible.map((u) => {
                const rc = roleCls(u.role)
                return (
                  <tr key={u.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="py-3.5 px-space-md">
                      <div className="flex items-center gap-space-sm">
                        <div className={`w-9 h-9 rounded bg-${u.avatarBg.split(' ')[0].replace('bg-', '')} text-${u.avatarBg.split(' ')[1].replace('text-', '')} font-bold text-xs flex items-center justify-center shrink-0 border ${u.avatarBg.split(' ')[2] || 'border-transparent'}`}>
                          {u.initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-text-primary font-bold flex items-center gap-1.5 truncate text-sm">
                            {u.name}
                            {u.role === 'Ministry Admin' && <span className="material-symbols-outlined text-[16px] text-amber-500" title="NIC Gold Tier Officer">workspace_premium</span>}
                          </span>
                          <span className="text-text-secondary text-xs truncate">{u.designation}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-space-md">
                      <div className="flex flex-col">
                        <span className="font-code-sm text-primary font-semibold font-mono text-xs">{u.email}</span>
                        <span className="font-code-xs text-text-muted font-mono text-[11px]">{u.nicId}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-space-md">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-border-crisp font-code-sm text-code-xs font-semibold ${rc.chip}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`}></span>
                        {u.roleTier || u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-space-md">
                      <div className="flex items-center gap-1.5">
                        <span className={`material-symbols-outlined text-[17px] shrink-0 ${rc.role === 'Ministry Admin' ? 'text-primary' : 'text-indigo-600'}`}>{rc.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-text-primary font-semibold text-xs">{u.cadence}</span>
                          <span className="font-code-xs text-text-muted text-[11px]">{u.scope}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-space-md">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-risk-success-bg text-risk-success border border-risk-success/20 font-code-xs text-[11px] font-semibold">
                        <span className="material-symbols-outlined text-[14px]">fingerprint</span>
                        {u.trust}
                      </span>
                    </td>
                    <td className="py-3.5 px-space-md">
                      <div className="flex flex-col">
                        <span className={`font-code-xs text-xs font-bold flex items-center gap-1 ${u.status === 'Active' ? 'text-risk-success' : 'text-text-muted'}`}>
                          {u.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>}
                          {u.lastActive}
                        </span>
                        <span className="font-code-xs text-text-muted font-mono text-[11px]">{u.lastActiveMeta}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-space-md text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border-crisp font-code-xs text-[11px] font-bold ${statusPill(u.status)}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-space-md text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-primary transition-colors" title="Edit Scoping"><span className="material-symbols-outlined text-[18px]">rule_folder</span></button>
                        <button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors" title="Impersonate Audit View"><span className="material-symbols-outlined text-[18px]">manage_search</span></button>
                        <button className="p-1.5 rounded hover:bg-surface-subtle text-text-muted hover:text-error transition-colors" title="Deactivate Access"><span className="material-symbols-outlined text-[18px]">block</span></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-text-muted font-code-xs text-code-xs">No officials match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-space-md py-2 bg-surface-subtle border-t border-border-crisp flex items-center justify-between">
          <p className="font-code-xs text-code-xs text-text-muted">MoRD / PM GatiShakti Role-Based Provisioning Matrix · Seed Reference Rows</p>
          <p className="font-code-xs text-code-xs text-text-muted">Expected: <code className="text-primary font-mono">GET {import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users</code></p>
        </div>
      </div>
    </AppShell>
  )
}