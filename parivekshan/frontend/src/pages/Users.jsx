import React, { useMemo, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import { useRole } from '../lib/roleContext'
import { can } from '../lib/permissions'

const SEEDED_USERS = [
  {
    id: 1, name: 'Dr. S. K. Verma, IAS', role: 'Ministry Admin', roleTier: 'Ministry Admin (Tier-1)',
    designation: 'Joint Secretary, MoRD (Land Resources)', email: 'sk.verma@gov.in', nicId: 'NIC-ID: DEL-IAS-1998-0442',
    state: 'National', cadence: 'National (All 766 Districts)', scope: 'Full Read/Write & Overrule',
    avatarBg: 'bg-sky-100 text-sky-900 border-sky-200', initials: 'SV', trust: 'e-Pramaan Active',
    lastActive: 'Active Now', lastActiveMeta: 'IP: 10.142.8.21 (GovNet)', status: 'Active',
  },
  {
    id: 2, name: 'Rajesh Deshmukh, IAS', role: 'District Authority',
    designation: 'District Collector & DM, Pune (CALA)', email: 'collector.pune@maharashtra.gov.in', nicId: 'NIC-ID: MH-IAS-2008-0119',
    state: 'Maharashtra', cadence: 'Pune & Satara Corridor', scope: 'Maharashtra Cadre • NH-48 Scope',
    avatarBg: 'bg-indigo-100 text-indigo-900 border-indigo-200', initials: 'RD', trust: 'NIC e-Pramaan Active',
    lastActive: '14 mins ago', lastActiveMeta: 'Approved Khasra #842', status: 'Active',
  },
  {
    id: 3, name: 'Siddharth Swain, IAS', role: 'District Authority',
    designation: 'District Magistrate & Collector, Angul', email: 'dm.angul@odisha.gov.in', nicId: 'NIC-ID: OD-IAS-2011-0217',
    state: 'Odisha', cadence: 'Angul & Dhenkanal', scope: 'Odisha Cadre • Sukinda Corridor',
    avatarBg: 'bg-slate-100 text-slate-800 border-slate-200', initials: 'SS', trust: 'e-Pramaan Active',
    lastActive: '1 hr ago', lastActiveMeta: 'Cleared Sec 3D Award', status: 'Active',
  },
  {
    id: 4, name: 'Anil Trivedi, IAS', role: 'District Authority',
    designation: 'District Magistrate, Gautam Buddha Nagar', email: 'dm.gbnagar@up.gov.in', nicId: 'NIC-ID: UP-IAS-2014-0331',
    state: 'Uttar Pradesh', cadence: 'GB Nagar & Meerut', scope: 'UP Cadre • Jewar Corridor',
    avatarBg: 'bg-emerald-100 text-emerald-900 border-emerald-200', initials: 'AT', trust: 'NIC e-Pramaan Active',
    lastActive: '3 hrs ago', lastActiveMeta: 'Gram Sabha minutes filed', status: 'Active',
  },
  {
    id: 5, name: 'Neha Kulkarni', role: 'Viewer',
    designation: 'Project Auditor, NITI Aayog', email: 'nehak@niti.gov.in', nicId: 'NIC-ID: NITI-2020-0103',
    state: 'Maharashtra', cadence: 'Read-Only Enclave', scope: 'Maharashtra portfolio',
    avatarBg: 'bg-teal-100 text-teal-900 border-teal-200', initials: 'NK', trust: 'e-Pramaan Verified',
    lastActive: 'Yesterday', lastActiveMeta: 'Export: 42 pdfs', status: 'Active',
  },
  {
    id: 6, name: 'Priyanka Rao', role: 'Viewer',
    designation: 'Lead Auditor, CAG Cell', email: 'prao@cag.gov.in', nicId: 'NIC-ID: CAG-2016-0067',
    state: 'National', cadence: 'National View Only', scope: 'All states read access',
    avatarBg: 'bg-rose-100 text-rose-900 border-rose-200', initials: 'PR', trust: 'e-Pramaan Verified',
    lastActive: '2 days ago', lastActiveMeta: 'No write access', status: 'Active',
  },
  {
    id: 7, name: 'Manish Prasad, IAS', role: 'Pending',
    designation: 'DM & Collector, Cuttack', email: 'dm.cuttack@odisha.gov.in', nicId: 'NIC-ID: OD-IAS-2022-0091',
    state: 'Odisha', cadence: 'Awaiting boundary bind', scope: 'NIC KYC documentary pending',
    avatarBg: 'bg-amber-100 text-amber-900 border-amber-200', initials: 'MP', trust: 'KYC verifying',
    lastActive: '—', lastActiveMeta: 'Docs: PAN, Gazette, NOC', status: 'Suspended',
  },
]

function roleCls(role) {
  switch (role) {
    case 'Ministry Admin': return { chip: 'bg-primary-container text-primary border-primary/20', dot: 'bg-primary', icon: 'travel_explore' }
    case 'District Authority': return { chip: 'bg-[#eef0fb] text-[#3f4a9e] border-[#d7dcf2]', dot: 'bg-[#5a67c4]', icon: 'share_location' }
    case 'Viewer': return { chip: 'bg-surface-container text-text-secondary border-border-strong', dot: 'bg-surface-dim', icon: 'visibility' }
    default: return { chip: 'bg-risk-critical-bg text-error border-error/20', dot: 'bg-error', icon: 'manage_search' }
  }
}

function statusPill(status) {
  return status === 'Active'
    ? 'bg-risk-success-bg text-risk-success border-risk-success/20'
    : 'bg-risk-critical-bg text-error border-error/20'
}

export default function Users() {
  const { role } = useRole()
  const allowed = can(role, 'manage_users')
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

  const states = Array.from(new Set(SEEDED_USERS.map((u) => u.state).filter((s) => s !== 'National'))).sort()

  const cardCls = 'bg-surface-card border border-border-crisp shadow-card'

  if (!allowed) {
    return (
      <AppShell title="Users" subtitle="Identity, roles & scope governance">
        <div className="bg-surface-card border border-error/25 rounded-xl p-6 max-w-md mx-auto text-center shadow-card">
          <span className="material-symbols-outlined text-[32px] text-error mb-2">lock</span>
          <p className="font-semibold text-text-primary mb-1">User management is restricted</p>
          <p className="text-sm text-text-muted">Only Ministry Admins can provision or edit user roles and scopes.</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Users" subtitle="Identity, roles & scope governance">
      <div className="flex flex-col gap-space-lg">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Identity, role &amp; scope governance</h1>
            <p className="text-[14px] text-text-muted mt-1 max-w-2xl">
              Role-based access control across Ministry officials, District Collectors and public auditors, with spatial boundary enforcement.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="hidden sm:flex items-center gap-2 px-space-md py-2 rounded-lg bg-surface-card border border-border-crisp text-[12px] text-text-secondary shadow-card">
              <span className="material-symbols-outlined text-[16px] text-risk-success">admin_panel_settings</span>
              <span className="text-text-primary font-semibold">Joint Sec (Land Resources)</span>
              <span className="font-mono text-text-muted">#MoRD-DEL-01</span>
            </div>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-card border border-border-crisp text-text-secondary hover:bg-surface-container text-[13px] font-medium transition-colors shadow-card">
              <span className="material-symbols-outlined text-[16px] text-text-muted">history_edu</span>
              Audit access logs
            </button>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-card border border-border-crisp text-text-secondary hover:bg-surface-container text-[13px] font-medium transition-colors shadow-card">
              <span className="material-symbols-outlined text-[16px] text-text-muted">download</span>
              Export matrix
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-accent-cyan-deep transition-colors shadow-card">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add official
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-base">
          <div className={`${cardCls} p-space-md flex flex-col justify-between border-l-4 border-l-primary`}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-text-muted tracking-wider uppercase">Registered personnel</span>
              <span className="material-symbols-outlined text-[20px] text-primary">group</span>
            </div>
            <div className="mt-space-md flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary font-mono tabular-nums">{SEEDED_USERS.length}</span>
              <span className="text-[12px] text-risk-success font-semibold">seeded rows</span>
            </div>
            <div className="mt-space-xs flex items-center justify-between text-[12px] text-text-muted pt-2 border-t border-border-crisp">
              <span>Reference directory</span>
              <span className="text-risk-success font-semibold">sample data</span>
            </div>
          </div>
          <div className={`${cardCls} p-space-md flex flex-col justify-between border-l-4 border-l-[#3f4a9e]`}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-text-muted tracking-wider uppercase">District authorities</span>
              <span className="material-symbols-outlined text-[20px] text-[#3f4a9e]">share_location</span>
            </div>
            <div className="mt-space-md flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary font-mono tabular-nums">{counts['District Authority'] || 0}</span>
              <span className="text-[12px] text-text-secondary font-medium">DMs / CALAs</span>
            </div>
            <div className="mt-space-xs flex items-center justify-between text-[12px] text-text-muted pt-2 border-t border-border-crisp">
              <span>Geo-fenced jurisdictions</span>
              <span className="text-primary font-semibold">boundary-enforced</span>
            </div>
          </div>
          <div className={`${cardCls} p-space-md flex flex-col justify-between border-l-4 border-l-secondary`}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-text-muted tracking-wider uppercase">Ministry admins</span>
              <span className="material-symbols-outlined text-[20px] text-secondary">security</span>
            </div>
            <div className="mt-space-md flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary font-mono tabular-nums">{counts['Ministry Admin'] || 0}</span>
              <span className="text-[12px] text-primary font-semibold">National scope</span>
            </div>
            <div className="mt-space-xs flex items-center justify-between text-[12px] text-text-muted pt-2 border-t border-border-crisp">
              <span>MoRD · NHAI · PMGSY</span>
              <span className="text-risk-success font-semibold">MFA enforced</span>
            </div>
          </div>
          <div className={`${cardCls} p-space-md flex flex-col justify-between border-l-4 border-l-border-strong`}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-text-muted tracking-wider uppercase">Auditors &amp; viewers</span>
              <span className="material-symbols-outlined text-[20px] text-text-muted">visibility</span>
            </div>
            <div className="mt-space-md flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary font-mono tabular-nums">{counts['Viewer'] || 0}</span>
              <span className="text-[12px] text-text-muted font-medium">read-only enclave</span>
            </div>
            <div className="mt-space-xs flex items-center justify-between text-[12px] text-text-muted pt-2 border-t border-border-crisp">
              <span>NITI · CAG cell</span>
              <span className="font-medium">no write access</span>
            </div>
          </div>
        </div>

        <div className="px-space-md py-space-sm rounded-xl bg-surface-card border border-border-crisp shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {TABS.map(([label, key]) => {
              const isPending = key === 'pending'
              const active = tab === label
              return (
                <button
                  key={key}
                  onClick={() => setTab(label)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] shrink-0 transition-all flex items-center gap-1 ${active
                    ? 'bg-primary text-white font-semibold shadow-sm'
                    : isPending
                      ? 'font-semibold text-error hover:bg-risk-critical-bg'
                      : 'font-medium text-text-secondary hover:text-text-primary hover:bg-surface-container'
                  }`}
                >
                  {isPending && <span className="w-1.5 h-1.5 rounded-full bg-error"></span>}
                  {label}
                  <span className={`ml-1 font-mono text-[11px] tabular-nums ${active ? 'opacity-90' : isPending ? '' : 'text-text-muted'}`}>
                    {(key === 'all' ? counts.all : (counts[label] || 0))}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="relative flex-1 min-w-[240px] sm:min-w-[280px]">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-surface-container border border-border-crisp pl-9 pr-3 py-2 rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary transition-all"
                placeholder="Search official, email, cadre, district…"
                type="text"
              />
            </div>
            <div className="relative">
              <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className="bg-surface-container border border-border-crisp text-text-primary text-[13px] font-medium py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none">
                <option value="National">Jurisdiction: National</option>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-[16px]">expand_more</span>
            </div>
            <div className="flex items-center rounded-lg border border-border-crisp bg-surface-container p-0.5">
              {['ALL', 'Active', 'Suspended'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-2.5 py-1 rounded-md text-[12px] transition-all ${status === s ? 'bg-white text-primary font-semibold shadow-sm border border-border-crisp' : 'text-text-secondary hover:text-text-primary font-medium'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-card border border-border-crisp shadow-card overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[960px]">
              <thead>
                <tr className="bg-surface-container border-b border-border-crisp text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                  <th className="py-3 px-space-md">Official name &amp; designation</th>
                  <th className="py-3 px-space-md">NIC identity / email</th>
                  <th className="py-3 px-space-md">Governance role</th>
                  <th className="py-3 px-space-md">Assigned cadre &amp; jurisdiction</th>
                  <th className="py-3 px-space-md">Identity trust</th>
                  <th className="py-3 px-space-md">Last active</th>
                  <th className="py-3 px-space-md text-center">Status</th>
                  <th className="py-3 px-space-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-crisp text-[13px] text-text-secondary bg-surface-card">
                {visible.map((u) => {
                  const rc = roleCls(u.role)
                  return (
                    <tr key={u.id} className="hover:bg-surface-container-low/70 transition-colors">
                      <td className="py-3.5 px-space-md">
                        <div className="flex items-center gap-space-sm">
                          <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border ${u.avatarBg}`}>
                            {u.initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-text-primary font-bold flex items-center gap-1.5 truncate text-sm">
                              {u.name}
                              {u.role === 'Ministry Admin' && <span className="material-symbols-outlined text-[16px] text-[#c0862d]" title="NIC gold tier officer">workspace_premium</span>}
                            </span>
                            <span className="text-text-secondary text-[12px] truncate">{u.designation}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-space-md">
                        <div className="flex flex-col">
                          <span className="font-mono text-primary font-semibold text-[12px]">{u.email}</span>
                          <span className="font-mono text-text-muted text-[11px]">{u.nicId}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-space-md">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border border-border-crisp text-[11px] font-semibold ${rc.chip}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`}></span>
                          {u.roleTier || u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-space-md">
                        <div className="flex items-center gap-1.5">
                          <span className={`material-symbols-outlined text-[17px] shrink-0 ${u.role === 'Ministry Admin' ? 'text-primary' : 'text-[#5a67c4]'}`}>{rc.icon}</span>
                          <div className="flex flex-col">
                            <span className="text-text-primary font-semibold text-[12px]">{u.cadence}</span>
                            <span className="font-mono text-text-muted text-[11px]">{u.scope}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-space-md">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-risk-success-bg text-risk-success border border-risk-success/20 text-[11px] font-semibold">
                          <span className="material-symbols-outlined text-[14px]">fingerprint</span>
                          {u.trust}
                        </span>
                      </td>
                      <td className="py-3.5 px-space-md">
                        <div className="flex flex-col">
                          <span className={`text-[12px] font-bold flex items-center gap-1 ${u.status === 'Active' ? 'text-risk-success' : 'text-text-muted'}`}>
                            {u.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>}
                            {u.lastActive}
                          </span>
                          <span className="font-mono text-text-muted text-[11px]">{u.lastActiveMeta}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-space-md text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold ${statusPill(u.status)}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-space-md text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-surface-container text-text-muted hover:text-primary transition-colors" title="Edit scoping"><span className="material-symbols-outlined text-[18px]">rule_folder</span></button>
                          <button className="p-1.5 rounded-lg hover:bg-surface-container text-text-muted hover:text-text-primary transition-colors" title="Audit view"><span className="material-symbols-outlined text-[18px]">manage_search</span></button>
                          <button className="p-1.5 rounded-lg hover:bg-surface-container text-text-muted hover:text-error transition-colors" title="Deactivate access"><span className="material-symbols-outlined text-[18px]">block</span></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-text-muted text-[12px]">No officials match the current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-space-md py-2 bg-surface-container border-t border-border-crisp flex flex-wrap items-center justify-between gap-space-sm">
            <p className="font-mono text-[11px] text-text-muted">MoRD / PM GatiShakti role-based provisioning matrix · sample rows</p>
            <p className="font-mono text-[11px] text-text-muted">Expected: <code className="text-primary">GET {import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users</code></p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}