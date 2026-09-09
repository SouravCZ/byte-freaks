import React, { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Logo from '../components/Logo'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const delayCurve = [
  { month: 'M-6', val: 25 }, { month: 'M-5', val: 32 }, { month: 'M-4', val: 41 },
  { month: 'M-3', val: 55 }, { month: 'M-2', val: 68 }, { month: 'M-1', val: 76 },
  { month: 'M0', val: 82 },
]

const corridorRisk = [
  { name: 'Delhi-Mumbai', risk: 76 },
  { name: 'Western DFC', risk: 64 },
  { name: 'Eastern DFC', risk: 48 },
  { name: 'Mumbai-Nagpur', risk: 55 },
  { name: 'Chennai-Bengaluru', risk: 38 },
]

const pipelineData = [
  { name: 'Q1', ingested: 1200, processed: 1100 },
  { name: 'Q2', ingested: 1500, processed: 1400 },
  { name: 'Q3', ingested: 1800, processed: 1700 },
  { name: 'Q4', ingested: 2100, processed: 2000 },
]

const riskPie = [
  { name: 'Delay Imminent', value: 34, color: '#dc2626' },
  { name: 'Under Review', value: 28, color: '#d97706' },
  { name: 'On Track', value: 38, color: '#059669' },
]

const testimonials = [
  { quote: 'Parivekshan AI transformed how we monitor infrastructure projects — from reactive firefighting to predictive governance. We mitigated an anticipated 14-month dispute on the Western Industrial Corridor before land possession commenced.', name: 'Dr. Rajeshwar Sharma, IAS (Retd.)', role: 'Former Principal Advisor — NHLL' },
]

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo className="h-10 w-auto" />
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-black">
            <a href="#problem" className="hover:text-black transition">Problem</a>
            <a href="#pipeline" className="hover:text-black transition">How It Works</a>
            <a href="#features" className="hover:text-black transition">Capabilities</a>
            <a href="#dashboard" className="hover:text-black transition">Dashboard</a>
            <a href="#impact" className="hover:text-black transition">Impact</a>
            <a href="#partners" className="hover:text-black transition">Partners</a>
            <a href="#contact" className="hover:text-black transition">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="#contact" className="hidden sm:inline-flex items-center px-4 py-2 bg-slate-200 text-black text-sm font-semibold rounded hover:bg-slate-300 transition">Log In</a>
            <a href="#contact" className="hidden sm:inline-flex items-center px-4 py-2 bg-slate-200 text-black border border-slate-300 text-sm font-semibold rounded hover:bg-slate-300 transition">Request Demo</a>
          </div>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-black text-xs font-semibold rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE MONITORING ACTIVE
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-black leading-[1.08] tracking-tight mb-6">
              Predict Land Acquisition Delays <span className="text-black">Before They Happen.</span>
            </h1>
            <p className="text-lg text-black leading-relaxed mb-8 max-w-xl">
              AI-powered geospatial risk scoring, revenue-litigation correlations, and automated nodal notifications engineered for NHAI, High-Speed Rail, and State Highway authorities.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <a href="#contact" className="inline-flex items-center px-6 py-3 bg-slate-200 text-black border border-slate-300 font-semibold rounded-lg hover:bg-slate-300 transition shadow-sm">
                Request Clearance Demo
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </a>
              <a href="#dashboard" className="inline-flex items-center px-6 py-3 border border-slate-300 text-black font-semibold rounded-lg hover:bg-slate-50 transition">
                Explore Dashboard
              </a>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-black text-lg">✓</span>
                <span className="text-black"><strong className="text-black">18M+</strong> High Court Precedents</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-black text-lg">✓</span>
                <span className="text-black"><strong className="text-black">Bhoomi & Bhulekh</strong> Cadastral Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-black text-lg">✓</span>
                <span className="text-black"><strong className="text-black">RFCTLARR</strong> Act Compliant</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="bg-slate-100 rounded-2xl border border-slate-300 p-6 text-black">
              <div className="flex items-center gap-2 mb-4 text-xs font-mono text-black">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                PREDICTIVE TELEMETRY PREVIEW
              </div>
              <div className="bg-slate-800 rounded-lg p-4 mb-4 border border-slate-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-black font-semibold">PKG #4A-DEL-MUM</span>
                  <span className="px-2 py-0.5 bg-red-500/20 text-black text-[10px] font-mono font-bold rounded">DELAY IMMINENT</span>
                </div>
                <p className="text-sm font-semibold mb-1">Delhi-Mumbai Greenfield Pkg 4</p>
                <p className="text-xs text-black mb-3">Vadodara-Kim Expressway Spur • Ch. 284+200 to 336+800</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-slate-200 rounded p-2">
                    <p className="text-[10px] font-mono text-black uppercase">Delay Risk Index</p>
                    <p className="text-xl font-bold text-black">76%</p>
                  </div>
                  <div className="bg-slate-200 rounded p-2">
                    <p className="text-[10px] font-mono text-black uppercase">Lead Time</p>
                    <p className="text-xl font-bold text-black">180d</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-black">Root Conflict</span><span className="text-black font-medium">Valuation Discrepancy</span></div>
                  <div className="flex justify-between"><span className="text-black">Landowners Objecting</span><span className="text-black font-medium">38</span></div>
                  <div className="flex justify-between"><span className="text-black">Section 3A</span><span className="text-black font-medium">Clear</span></div>
                  <div className="flex justify-between"><span className="text-black">Section 3D</span><span className="text-black font-medium">Pending</span></div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={delayCurve}>
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: 11 }} />
                  <Area type="monotone" dataKey="val" stroke="#10b981" fill="url(#heroGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProblemSection() {
  const problems = [
    { icon: '🚫', title: 'No Early Warning System', stat: '+$42M', statLabel: 'Avg Cost Overrun / Pkg', desc: 'Critical land possession logjams surface only after construction mobilization freeze. By the time nodal teams notice resistance, contractors levy 12-24 month idle plant claims.' },
    { icon: '📁', title: 'Manual Delay Tracking', stat: '45-90', statLabel: 'Calendar Days Latency', desc: 'Fragmented khasra maps, dusty physical revenue ledgers, and siloed District Revenue Offices preclude unified intelligence across multiple state jurisdictions.' },
    { icon: '⚖️', title: 'Reactive Interventions', stat: '71%', statLabel: 'Litigation Recidivism', desc: 'High-level bureaucratic escalations only happen post-stay order by High Courts or civil tribunals, turning solvable title disputes into protracted multi-year legal quagmires.' },
  ]

  return (
    <section id="problem" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-black uppercase tracking-widest mb-3">Sovereign Bottleneck Analysis</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black tracking-tight mb-4">The Critical Bottleneck in National Infrastructure</h2>
          <p className="text-black max-w-2xl mx-auto">Over 64% of mega highway, railway, and transmission corridors face catastrophic time overruns due to antiquated cadastral tracking and late-stage tribunal litigation.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((p) => (
            <div key={p.title} className="bg-slate-50 rounded-xl border border-slate-200 p-6 hover:border-red-200 transition">
              <span className="text-3xl mb-4 block">{p.icon}</span>
              <h3 className="font-bold text-black mb-2">{p.title}</h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-extrabold text-black">{p.stat}</span>
                <span className="text-xs font-mono text-black uppercase">{p.statLabel}</span>
              </div>
              <p className="text-sm text-black leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pipeline() {
  const phases = [
    { num: '01', title: 'Ingest Multi-Tier Data', desc: 'Continuous vectorization of GIS cadastral maps, digital Record of Rights (RoR), e-Courts case registries, and drone photogrammetry strips.', tags: ['Bhulekh Sync', 'e-Courts API'], badge: 'Active' },
    { num: '02', title: 'ML Probability Modeling', desc: 'Gradient-boosted decision trees and spatial neural networks evaluate parcel fragmentation index, title encumbrance density, and award disparity.', tags: ['Model Fidelity 95.4%', 'Confidence ±12 Days'], badge: 'Active' },
    { num: '03', title: 'Root-Cause Attribution', desc: 'Automated SHAP breakdown identifying specific statutory roadblocks: forest conservation clearances, village community objections, or circle-rate arbitrage.', tags: ['Factor Isolation: 14 Parameters', 'Audit Trail: Immutable'], badge: 'Active' },
    { num: '04', title: 'Preemptive Intervention', desc: 'Escalation dispatched directly to District Collectors, Special Land Acquisition Officers, and Ministry Project Directors 6-9 months prior to milestone freeze.', tags: ['Lead Foresight: 180-270 Days', 'Protocol: Automated SMS/Email'], badge: 'Active' },
  ]

  return (
    <section id="pipeline" className="py-20 bg-slate-100 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-black uppercase tracking-widest mb-3">End-to-End Pipeline</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">From Fragmented Land Records to Actionable Foresight</h2>
          <p className="text-black max-w-2xl mx-auto">A battle-tested machine learning architecture calibrated against 15+ years of Indian land acquisition jurisprudence.</p>
          <span className="inline-flex mt-4 px-3 py-1 bg-emerald-500/10 text-black text-[10px] font-mono font-semibold uppercase tracking-widest rounded-full border border-emerald-500/20">ISO 27001 Compliant</span>
        </div>
        <div className="space-y-4">
          {phases.map((p) => (
            <div key={p.num} className="bg-slate-800 rounded-xl border border-slate-300 p-6 flex flex-col lg:flex-row lg:items-center gap-4 hover:border-slate-600 transition">
              <div className="flex items-center gap-4 shrink-0 lg:w-80">
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-200 border border-slate-400 text-black text-sm font-bold font-mono">{p.num}</span>
                <h3 className="font-bold text-black">{p.title}</h3>
              </div>
              <p className="text-sm text-black leading-relaxed flex-1">{p.desc}</p>
              <div className="flex flex-wrap gap-2 shrink-0">
                {p.tags.map((t) => (
                  <span key={t} className="px-2.5 py-1 bg-slate-200 text-black text-xs font-mono rounded border border-slate-400">{t}</span>
                ))}
              </div>
              <span className="shrink-0 px-2 py-0.5 bg-emerald-500/10 text-black text-[10px] font-mono font-semibold uppercase rounded">{p.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    { icon: '🧠', title: 'AI/ML Delay Forecasting', badge: '95% Accuracy', desc: 'Anticipate possession hand-over delays months in advance across high-speed rail, expressways, and renewable energy parks.' },
    { icon: '📊', title: 'Project-Wise Risk Scoring', badge: '0-100 Index', desc: 'Composite Delay Vulnerability index derived from historical gazette notifications, district revenue dispute intensity, and local court pendency ratios.' },
    { icon: '🌳', title: 'Explainable AI (XAI)', badge: 'Judicial Proof', desc: 'No black-box ambiguity. Full SHAP and feature attribution trees formatted for statutory reporting and parliamentary query defensibility.' },
    { icon: '🗺️', title: 'Interactive Dashboards', badge: 'Multi-Tier', desc: 'Pivot from national ministry overview down to state corridors, district collectorates, and specific survey khasra parcels in three clicks.' },
    { icon: '🛰️', title: 'GIS Map Overlays', badge: 'Sub-Meter', desc: 'Spatial cross-referencing of Right-of-Way boundaries with revenue village polygons, forest reserve buffers, flood zones, and litigation injunctions.' },
    { icon: '📡', title: 'Automated Escalations', badge: 'Real-Time', desc: 'Rule-based alerts with prescriptive mitigation protocols dispatched directly via SMS and encrypted sovereign mail to designated Nodal Land Officers.' },
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-black uppercase tracking-widest mb-3">Enterprise Feature Suite</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black tracking-tight mb-4">Purpose-Built for Sovereign Infrastructure Management</h2>
          <p className="text-black max-w-2xl mx-auto">Engineered to satisfy stringent administrative accountability and judicial scrutiny requirements under statutory acquisition mandates.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-slate-50 rounded-xl border border-slate-200 p-6 hover:border-emerald-300 hover:bg-white transition group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{f.icon}</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-black text-[10px] font-mono font-semibold uppercase tracking-wider rounded">{f.badge}</span>
              </div>
              <h3 className="font-bold text-black mb-2">{f.title}</h3>
              <p className="text-sm text-black leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DashboardPreview() {
  const [stats, setStats] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ctrl = new AbortController()
    Promise.all([
      fetch(`${API_BASE}/api/stats`, { signal: ctrl.signal }).then((r) => r.json()),
      fetch(`${API_BASE}/api/blocks`, { signal: ctrl.signal }).then((r) => r.json()),
    ])
      .then(([statsData, blocksData]) => {
        setStats(statsData)
        setBlocks(Array.isArray(blocksData) ? blocksData : [])
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('Failed to load command center telemetry:', err)
      })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [])

  const delayPct = blocks.length > 0
    ? Math.round((blocks.filter((b) => Number(b.risk_score) >= 75).length / blocks.length) * 100)
    : 34

  return (
    <section id="dashboard" className="py-20 bg-slate-100 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-black uppercase tracking-widest mb-3">Sovereign Spatial Dashboard</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Command Center for Infrastructure Delivery</h2>
        </div>
        <div className="bg-slate-800 rounded-2xl border border-slate-300 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-300">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            </div>
            <span className="text-xs font-mono text-black">command.parivekshan.nic.in/analytics/delhi-mumbai-corridor</span>
            <span className="ml-auto text-[10px] font-mono text-black uppercase">Official Use Only • Govt Tier-IV</span>
          </div>
          <div className="p-6 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Active Corridors', value: stats ? String(stats.totalProjects) : '—', color: 'text-black' },
                  { label: 'States Covered', value: stats ? String(stats.totalBlocks) : '—', color: 'text-black' },
                  { label: 'Collectorates', value: stats ? String(stats.totalProjects) : '—', color: 'text-black' },
                  { label: 'Parcels in Delay', value: stats ? `${delayPct}%` : '—', color: 'text-black' },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-200 rounded-lg p-3">
                    <p className="text-[10px] font-mono text-black uppercase tracking-wider mb-1">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color}`}>{loading ? '...' : s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-200 rounded-lg p-4">
                <h4 className="text-xs font-mono text-black uppercase tracking-wider mb-3">Corridor Risk Comparison</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={blocks.length > 0 ? blocks.map((b) => ({ name: b.name, risk: Number(b.risk_score) })) : corridorRisk} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#64748b" fontSize={11} domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={120} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="risk" radius={[0, 4, 4, 0]}>
                      {(blocks.length > 0 ? blocks : corridorRisk).map((entry, i) => (
                        <Cell key={i} fill={Number(entry.risk_score || entry.risk) >= 70 ? '#dc2626' : Number(entry.risk_score || entry.risk) >= 50 ? '#d97706' : '#059669'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-200 rounded-lg p-4">
                <h4 className="text-xs font-mono text-black uppercase tracking-wider mb-3">Risk Distribution</h4>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={riskPie} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value">
                        {riskPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {riskPie.map((d) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: d.color }}></span>
                        <span className="text-xs text-black">{d.name}: <strong className="text-black">{d.value}%</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-slate-200 rounded-lg p-4">
                <h4 className="text-xs font-mono text-black uppercase tracking-wider mb-3">Processing Pipeline</h4>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={pipelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: 11 }} />
                    <Line type="monotone" dataKey="ingested" stroke="#64748b" strokeWidth={2} dot={false} name="Ingested" />
                    <Line type="monotone" dataKey="processed" stroke="#10b981" strokeWidth={2} dot={false} name="Processed" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-200 rounded-lg p-4">
                <h4 className="text-xs font-mono text-black uppercase tracking-wider mb-2">Live Feed</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><span className="text-black">NHAI — Corridor sync active</span></div>
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><span className="text-black">DFCCIL — DFC-East telemetry OK</span></div>
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span className="text-black">WB PWD — 3 parcels flagged</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Impact() {
  const stats = [
    { value: '30%', label: 'Faster Approvals', sub: 'AUDITED VIA CAG BENCHMARKS', desc: 'Accelerated statutory Section 3E/3G declaration cycles through preemptive stakeholder notification.' },
    { value: '40%', label: 'Reduction in Delays', sub: '8-MONTH MEAN PREEMPTION', desc: 'Measured across marquee greenfield expressway packages facing complex multi-cadastral compensation objections.' },
    { value: '500+', label: 'Projects Monitored', sub: '28 STATE JURISDICTIONS', desc: 'Covering over 42,000 km of vital economic highways, high-speed rail lines, and dedicated freight corridors.' },
    { value: '95%', label: 'Prediction Accuracy', sub: 'CONFIDENCE INTERVAL ±4.2%', desc: 'Statistically validated against 10-year historical dispute outcomes across High Courts and National Green Tribunal registries.' },
  ]

  return (
    <section id="impact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-black uppercase tracking-widest mb-3">Measurable Sovereign Value</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">Validated Impact Across Critical Corridors</h2>
          <p className="text-black mt-3">Longitudinal audit data across 42,000+ route-kilometers of surveyed national logistics corridors.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((s) => (
            <div key={s.label} className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
              <p className="text-4xl font-extrabold text-black mb-2">{s.value}</p>
              <p className="font-bold text-black mb-1">{s.label}</p>
              <p className="text-[10px] font-mono text-black uppercase tracking-wider mb-2">{s.sub}</p>
              <p className="text-sm text-black leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 max-w-3xl mx-auto">
          <p className="text-xs font-mono text-black uppercase tracking-wider mb-4">Principal Advisor Evaluation — CASE REF: NHLML-WIC-2024</p>
          <blockquote className="text-lg text-black leading-relaxed italic mb-4">"{testimonials[0].quote}"</blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-400 flex items-center justify-center text-black font-bold text-sm">RS</div>
            <div>
              <p className="font-semibold text-black text-sm">{testimonials[0].name}</p>
              <p className="text-xs text-black">{testimonials[0].role}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="py-20 bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-mono text-black uppercase tracking-widest mb-3">Empanelment & Deployment</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black tracking-tight mb-4">Deploy Parivekshan AI on Your Corridor</h2>
          <p className="text-black">Connect your project GIS boundary files (.shp / .kml) and receive an audited Delay Probability Scorecard within 48 operational hours.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Full Name & Designation *</label>
              <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Official Government Email *</label>
              <input type="email" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition" placeholder="gov.in / nic.in preferred" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Department / Ministry *</label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition">
                <option>Select Agency</option>
                <option>National Highways Authority of India (NHAI)</option>
                <option>Ministry of Railways / DFCCIL</option>
                <option>State Public Works Department (PWD)</option>
                <option>Department of Land Resources (DLR)</option>
                <option>Ministry of Power / Transmission Corp</option>
                <option>Other Central/State Infrastructure Agency</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Infrastructure Sector *</label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition">
                <option>Select Sector</option>
                <option>Expressways & Economic Corridors</option>
                <option>High-Speed Freight Rail</option>
                <option>Mega Solar / Renewable Parks</option>
                <option>Metropolitan Rapid Transit / Ports</option>
                <option>Hydrocarbon & Gas Pipelines</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Project Scope & Corridor Length</label>
              <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition" placeholder="KM / Ha" />
            </div>
            <div className="flex gap-3">
              <button className="flex-1 px-6 py-3 border border-slate-300 text-black font-semibold rounded-lg hover:bg-slate-50 transition text-sm">Cancel</button>
              <button className="flex-1 px-6 py-3 bg-slate-200 text-black border border-slate-300 font-semibold rounded-lg hover:bg-slate-300 transition">Submit Clearance Request</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-slate-100 text-black py-16 border-t border-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Logo className="h-12 w-auto brightness-0 invert mb-4" />
            <p className="text-sm text-black leading-relaxed mb-4">National predictive land acquisition delay framework modeling cadastral anomalies, encumbrance risks, and geospatial litigation velocity for mega infrastructure assets.</p>
            <p className="text-xs text-black italic">In collaboration with Department of Land Resources (DLR) & Ministry of Rural Development</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Platform Intelligence</h4>
            <ul className="space-y-2 text-sm text-black">
              <li><a href="#" className="hover:text-black transition">About Parivekshan AI</a></li>
              <li><a href="#" className="hover:text-black transition">Capabilities</a></li>
              <li><a href="#" className="hover:text-black transition">Case Studies & Benchmarks</a></li>
              <li><a href="#" className="hover:text-black transition">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Governance & Support</h4>
            <ul className="space-y-2 text-sm text-black">
              <li><a href="#" className="hover:text-black transition">Contact & Grievance Cell</a></li>
              <li><a href="#" className="hover:text-black transition">Statutory Compliance</a></li>
              <li><a href="#" className="hover:text-black transition">Cadastral Data Integrity</a></li>
              <li><a href="#" className="hover:text-black transition">Vigilance & Audit Trail</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Compliance & Certifications</h4>
            <ul className="space-y-2 text-sm text-black">
              <li className="flex items-center gap-2"><span className="text-black">✓</span> ISO 27001:2022 Certified</li>
              <li className="flex items-center gap-2"><span className="text-black">✓</span> WCAG 2.1 AA Compliant</li>
              <li className="flex items-center gap-2"><span className="text-black">✓</span> MeitY Empanelled</li>
              <li className="flex items-center gap-2"><span className="text-black">✓</span> Govt Tier-IV Cloud</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-navy-400/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-black">© 2025 Parivekshan AI. National Spatial Decision Support System.</p>
          <div className="flex gap-4 text-xs text-black">
            <a href="#" className="hover:text-black transition">Privacy Policy</a>
            <a href="#" className="hover:text-black transition">Terms of Spatial Use</a>
            <a href="#" className="hover:text-black transition">Cyber Security Norms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function NationalLanding() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ProblemSection />
      <Pipeline />
      <Features />
      <DashboardPreview />
      <Impact />
      <Contact />
      <Footer />
    </div>
  )
}
