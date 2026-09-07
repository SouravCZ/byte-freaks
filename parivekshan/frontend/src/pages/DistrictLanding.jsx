import React, { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Logo from '../components/Logo'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const delayData = [
  { month: 'Jan', probability: 32 },
  { month: 'Feb', probability: 38 },
  { month: 'Mar', probability: 45 },
  { month: 'Apr', probability: 52 },
  { month: 'May', probability: 58 },
  { month: 'Jun', probability: 55 },
  { month: 'Jul', probability: 62 },
  { month: 'Aug', probability: 70 },
  { month: 'Sep', probability: 75 },
  { month: 'Oct', probability: 68 },
  { month: 'Nov', probability: 60 },
  { month: 'Dec', probability: 54 },
]

const milestoneData = [
  { name: 'Q1', onTime: 65, delayed: 35 },
  { name: 'Q2', onTime: 55, delayed: 45 },
  { name: 'Q3', onTime: 40, delayed: 60 },
  { name: 'Q4', onTime: 50, delayed: 50 },
]

const riskPieData = [
  { name: 'High Risk', value: 34, color: '#dc2626' },
  { name: 'Medium Risk', value: 42, color: '#d97706' },
  { name: 'Low Risk', value: 24, color: '#059669' },
]

const projects = [
  { id: 1, name: 'Basirhat Border Fencing Pkg 2', block: 'Basirhat', risk: 86, status: 'Critical', type: 'Border Infrastructure' },
  { id: 2, name: 'NH12 Amdanga Expansion', block: 'Amdanga', risk: 62, status: 'Moderate', type: 'Highway' },
  { id: 3, name: 'Barasat Logistics Park Hub', block: 'Barasat', risk: 22, status: 'Low', type: 'Industrial' },
  { id: 4, name: 'Hingalganj Embankment R&R', block: 'Hingalganj', risk: 74, status: 'High', type: 'Resettlement' },
  { id: 5, name: 'Barrackpore Industrial Corridor', block: 'Barrackpore', risk: 45, status: 'Moderate', type: 'Industrial' },
]

const shapDrivers = [
  { factor: 'Compensation Discrepancies', impact: 82 },
  { factor: 'R&R Clearance Delays', impact: 71 },
  { factor: 'Court Stays', impact: 65 },
  { factor: 'Documentation Gaps', impact: 54 },
  { factor: 'Inter-Dept Coordination', impact: 43 },
]

function RiskBadge({ risk }) {
  if (risk >= 75) return <span className="px-2.5 py-0.5 text-xs font-semibold font-mono rounded bg-red-100 text-red-800 border border-red-300">{risk}% HIGH</span>
  if (risk >= 50) return <span className="px-2.5 py-0.5 text-xs font-semibold font-mono rounded bg-amber-100 text-amber-800 border border-amber-300">{risk}% MOD</span>
  return <span className="px-2.5 py-0.5 text-xs font-semibold font-mono rounded bg-emerald-100 text-emerald-800 border border-emerald-300">{risk}% LOW</span>
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-auto" />
            <div className="hidden md:block border-l border-slate-200 pl-3 ml-1">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">District Command Portal</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#hero" className="hover:text-navy-500 transition">Home</a>
            <a href="#context" className="hover:text-navy-500 transition">Context</a>
            <a href="#how-it-works" className="hover:text-navy-500 transition">How It Works</a>
            <a href="#features" className="hover:text-navy-500 transition">Features</a>
            <a href="#dashboard" className="hover:text-navy-500 transition">Dashboard</a>
            <a href="#impact" className="hover:text-navy-500 transition">Impact</a>
            <a href="#use-cases" className="hover:text-navy-500 transition">Use Cases</a>
            <a href="#faq" className="hover:text-navy-500 transition">FAQ</a>
            <a href="#contact" className="hover:text-navy-500 transition">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="#contact" className="hidden sm:inline-flex items-center px-4 py-2 bg-navy-500 text-white text-sm font-semibold rounded hover:bg-navy-600 transition">
              Request Demo
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section id="hero" className="pt-24 pb-16 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 bg-navy-500/10 text-navy-500 text-[10px] font-mono font-semibold uppercase tracking-widest rounded">Office of the District Magistrate & Collector</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.08] tracking-tight mb-6">
            Predict Land Acquisition Delays in North 24 Parganas — <span className="text-emerald-600">Before They Happen</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl">
            An AI-powered decision support system for the District Collector's Office. Forecast delays, identify risk drivers, and prioritize interventions across all 42 blocks and 3,800+ mouzas.
          </p>
          <div className="flex flex-wrap gap-3 mb-10">
            <a href="#contact" className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm">
              Request District Demo
            </a>
            <a href="#dashboard" className="inline-flex items-center px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition">
              Explore Sample Dashboard
            </a>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> NIC-GIS Interoperable</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aligned with LARR Act 2013</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Ministry of Rural Development</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContextSection() {
  const zones = [
    { name: 'Basirhat', desc: 'Riverine border & R&R bottlenecks', risk: 86, color: 'bg-red-500' },
    { name: 'Hingalganj', desc: 'Erosion & legal disputes', risk: 74, color: 'bg-red-400' },
    { name: 'Amdanga', desc: 'NH12 valuation disputes', risk: 62, color: 'bg-amber-500' },
    { name: 'Barrackpore', desc: 'Industrial utility shifting', risk: 45, color: 'bg-amber-400' },
  ]

  return (
    <section id="context" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-xs font-mono text-emerald-600 uppercase tracking-widest mb-3">Operational Ground Reality</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-6">
              Why North 24 Parganas Needs Predictive Land Monitoring
            </h2>
            <div className="prose prose-slate text-slate-600 leading-relaxed space-y-4">
              <p>North 24 Parganas is one of West Bengal's most dynamic yet complex districts for land acquisition. Spanning 42 blocks, over 3,800 mouzas, and a population exceeding 10 million, the district faces unique challenges: riverine erosion along the Ichhamati and Kalindi, dense settlement patterns, contested compensation claims, legacy legal disputes, and inter-departmental coordination gaps.</p>
              <p>Recent infrastructure initiatives — including border fencing projects, NH12 expansion, industrial corridors, and rehabilitation schemes — have encountered significant delays due to prolonged administrative approvals, incomplete documentation, rehabilitation and resettlement (R&R) bottlenecks, and stakeholder resistance.</p>
              <p>Traditional monitoring systems rely on manual reporting and reactive interventions, often identifying delays only after critical milestones are missed. Parivekshan AI addresses this gap by providing an AI-enabled early warning system.</p>
            </div>
          </div>
          <div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-6">
              <h3 className="text-sm font-mono text-slate-500 uppercase tracking-wider mb-4">Live AI Risk Telemetry</h3>
              <div className="grid grid-cols-2 gap-3">
                {zones.map((z) => (
                  <div key={z.name} className="bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${z.color}`}></span>
                      <span className="font-semibold text-slate-900 text-sm">{z.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{z.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">Risk Score</span>
                      <span className={`text-sm font-bold font-mono ${z.risk >= 75 ? 'text-red-600' : z.risk >= 50 ? 'text-amber-600' : 'text-emerald-600'}`}>{z.risk}%</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${z.color}`} style={{ width: `${z.risk}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Legal Disputes', 'Compensation Delays', 'Documentation Gaps', 'R&R Challenges', 'Inter-Dept Coordination'].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-200">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { num: '01', title: 'Data Ingestion', desc: 'Securely integrate historical land acquisition records, project timelines, compensation data, legal case files, and GIS maps from district databases.' },
    { num: '02', title: 'Feature Engineering', desc: 'Extract 50+ predictive features: project type, land area, affected families, approval timelines, possession status, R&R progress.' },
    { num: '03', title: 'ML Prediction Engine', desc: 'Train ensemble models (Random Forest, XGBoost, Neural Networks) to forecast delay probability at each lifecycle stage.' },
    { num: '04', title: 'Risk Scoring', desc: 'Assign each project a risk score (0-100) with color-coded categorization: Low (Green), Medium (Yellow), High (Red).' },
    { num: '05', title: 'Explainable AI', desc: 'Use SHAP values and feature importance analysis to show which factors are driving each prediction.' },
    { num: '06', title: 'Command Dashboards', desc: 'Deliver interactive, role-based dashboards with real-time alerts, trend visualizations, and recommended interventions.' },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-emerald-600 uppercase tracking-widest mb-3">Intelligent Processing Architecture</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">From Data to Decision: How It Works</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">A transparent, machine-learning-driven six-stage pipeline engineered for statutory compliance and prompt executive remediation.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition group">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-navy-500 text-white text-sm font-bold font-mono">{step.num}</span>
                <h3 className="font-bold text-slate-900">{step.title}</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    { icon: '🧠', title: 'AI/ML Delay Forecasting', badge: '90%+ Precision', desc: 'Predicts stage delay probabilities with continuous learning across all statutory acquisition milestones.' },
    { icon: '📊', title: 'Project-Wise Risk Scoring', badge: '0-100 Index', desc: 'Dynamic risk score, priority sorting queue for the District Collector, and granular milestone drill-down.' },
    { icon: '🔍', title: 'Explainable AI Transparency', badge: 'SHAP Attribution', desc: 'Full feature attribution trees with plain-language rationale and evidentiary audit trails.' },
    { icon: '🗺️', title: 'Interactive District Dashboards', badge: 'Multi-Level', desc: 'Block and mouza-level heatmaps, live Gantt milestone schedules, and cross-project analytics.' },
    { icon: '📡', title: 'GIS-Enabled Visualization', badge: 'Cadastral Overlay', desc: 'Digital boundary overlay with block/risk filtering and mouza parcel boundaries.' },
    { icon: '🔔', title: 'Automated Alerts', badge: 'Multi-Channel', desc: 'SMS, Email, and in-app alerts with dynamic risk threshold triggers and escalation workflows.' },
    { icon: '💡', title: 'Predictive Recommendations', badge: 'AI-Suggested', desc: 'Administrative interventions, statutory playbook, and workflow integration.' },
    { icon: '🔄', title: 'Continuous Model Learning', badge: 'Quarterly Audit', desc: 'Automated retraining pipeline with instant model version rollback control.' },
    { icon: '🔐', title: 'Secure APIs & Integration', badge: 'RBAC + TLS 1.3', desc: 'RESTful integration with LACRRIS, Bhumi databases, e-Courts with end-to-end encryption.' },
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-emerald-600 uppercase tracking-widest mb-3">Enterprise Capabilities</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">Comprehensive District Command Capabilities</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Nine integrated modules built specifically for high-stakes governance and regulatory precision.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-slate-50 rounded-xl border border-slate-200 p-6 hover:border-emerald-300 hover:bg-white transition group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{f.icon}</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-mono font-semibold uppercase tracking-wider rounded">{f.badge}</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DashboardPreview() {
  const [activeProject, setActiveProject] = useState(0)
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
        if (err.name !== 'AbortError') console.error('Failed to load dashboard telemetry:', err)
      })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [])

  return (
    <section id="dashboard" className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-3">Live Telemetry Interface</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">District Command Center: Operational Telemetry</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">High-fidelity situational awareness designed for fast, data-backed administrative intervention.</p>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-700 bg-slate-800/50">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            </div>
            <span className="text-xs font-mono text-slate-400">parivekshan.wb.gov.in/district/north24parganas/live</span>
            <span className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Latency: 48ms
            </span>
          </div>

          <div className="grid lg:grid-cols-3 gap-0">
            <div className="lg:col-span-1 border-r border-slate-700 p-4">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Project Queue</h4>
              <div className="space-y-2">
                {blocks.length > 0 ? (
                  blocks.map((p, i) => (
                    <button key={p.id} onClick={() => setActiveProject(i)}
                      className={`w-full text-left p-3 rounded-lg transition text-sm ${activeProject === i ? 'bg-navy-500/30 border border-navy-400/30' : 'hover:bg-slate-700/50 border border-transparent'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white truncate">{p.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">{p.district}</span>
                        <RiskBadge risk={Number(p.risk_score)} />
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">{loading ? 'Loading telemetry...' : 'No block data available'}</p>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 p-6">
              {blocks.length > 0 && (
                <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">{blocks[activeProject].name}</h3>
                  <p className="text-sm text-slate-400">Active Block: {blocks[activeProject].district} | Risk Level: {blocks[activeProject] && Number(blocks[activeProject].risk_score) >= 75 ? 'Critical' : Number(blocks[activeProject].risk_score) >= 50 ? 'Moderate' : 'Low'}</p>
                </div>
                <RiskBadge risk={Number(blocks[activeProject].risk_score)} />
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Delay Probability</p>
                  <p className="text-2xl font-bold text-emerald-400">{Number(blocks[activeProject].risk_score).toFixed(0)}%</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Mouzas Affected</p>
                  <p className="text-2xl font-bold text-white">{blocks[activeProject].mouza_count}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Lead Time</p>
                  <p className="text-2xl font-bold text-amber-400">{Number(blocks[activeProject].risk_score) >= 75 ? '180d' : Number(blocks[activeProject].risk_score) >= 50 ? '120d' : '60d'}</p>
                </div>
              </div>
              </>
              )}
              {blocks.length === 0 && (
                <div className="flex items-center justify-center h-64">
                  <p className="text-slate-400">{loading ? 'Loading live telemetry...' : 'No telemetry available'}</p>
                </div>
              )}

              <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Delay Probability Curve</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={delayData}>
                    <defs>
                      <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                    <Area type="monotone" dataKey="probability" stroke="#10b981" fill="url(#colorProb)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">SHAP Risk Drivers</h4>
                <div className="space-y-2">
                  {shapDrivers.map((d) => (
                    <div key={d.factor} className="flex items-center gap-3">
                      <span className="text-xs text-slate-300 w-48 shrink-0">{d.factor}</span>
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${d.impact}%` }}></div>
                      </div>
                      <span className="text-xs font-mono text-slate-400 w-10 text-right">{d.impact}%</span>
                    </div>
                  ))}
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
    { value: '30%', label: 'Faster Approvals', desc: 'Reduce average approval cycle time from 120 to 84 days through early bottleneck detection.' },
    { value: '40%', label: 'Reduction in Delays', desc: 'Cut project delays >6 months by nearly half with proactive interventions.' },
    { value: '500+', label: 'Projects Monitored', desc: 'Track all ongoing and planned land acquisition projects across the district.' },
    { value: '95%', label: 'Prediction Accuracy', desc: 'ML models achieve 95% precision in identifying high-risk projects 3-6 months in advance.' },
  ]

  return (
    <section id="impact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-emerald-600 uppercase tracking-widest mb-3">Measurable Outcomes</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">District-Specific Impact Metrics</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-4xl font-extrabold text-navy-500 mb-2">{s.value}</p>
              <p className="font-bold text-slate-900 mb-2">{s.label}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-slate-50 rounded-xl border border-slate-200 p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6">District Vulnerability Distribution</h3>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={milestoneData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Bar dataKey="onTime" fill="#10b981" radius={[4, 4, 0, 0]} name="On Time" />
                <Bar dataKey="delayed" fill="#dc2626" radius={[4, 4, 0, 0]} name="Delayed" />
              </BarChart>
            </ResponsiveContainer>
            <div>
              <h4 className="text-sm font-mono text-slate-400 uppercase tracking-wider mb-3">Risk Category Breakdown</h4>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {riskPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {riskPieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded" style={{ backgroundColor: d.color }}></span>
                      <span className="text-sm text-slate-600">{d.name}: <strong>{d.value}%</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function UseCases() {
  const cases = [
    { id: 1, title: 'Border Fencing Projects', blocks: 'Basirhat, Hingalganj', desc: 'International border fencing requires coordination between BSF, State Revenue department, and displaced agricultural owners. Parivekshan AI continuously reviews compensation disbursement records, legal filings, and R&R plans.', risk: 86, driver: 'Compensation verification backlog & riverine border parcel disputes.', intervention: 'Deploy Special Revenue Camp at Basirhat II BDO Office; fast-track Mouza joint title hearings.' },
    { id: 2, title: 'NH12 Expansion', blocks: 'Amdanga Block', desc: 'National Highway 12 widening has suffered historical disputes regarding commercial valuation disparities. Parivekshan AI detected valuation disputes across >100 affected families early.', risk: 62, driver: 'Utility shifting delays and commercial tenant compensation claims.', intervention: 'Schedule Joint Collectorate-WBSEDCL site coordination; disburse commercial advance deposits.' },
    { id: 3, title: 'Industrial Corridor Development', blocks: 'Barrackpore, Dum Dum', desc: 'High-density peri-urban corridors demand multi-agency clearance. The platform optimizes inter-departmental coordination by predicting bottlenecks in utility shifting and industrial environmental clearances.', risk: 22, driver: 'Minor environmental clearance documentation lag.', intervention: 'Automated notice dispatch to State Pollution Control Board; routine track milestone.' },
    { id: 4, title: 'Rehabilitation & Resettlement', blocks: 'Hingalganj', desc: 'Ensuring compliance with statutory human-rights standards. Parivekshan AI tracks housing completion, livelihood replacement grant distributions, and Mouza X tracking.', risk: 54, driver: 'Land-for-land replacement titling in tidal saline zones.', intervention: 'Activate Sub-Divisional Officer grievance hearing; synchronize alternative mouza patta awards.' },
  ]

  const [expanded, setExpanded] = useState(0)

  return (
    <section id="use-cases" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-emerald-600 uppercase tracking-widest mb-3">Operational Ground Scenarios</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">District Use Cases & Practical Interventions</h2>
        </div>
        <div className="space-y-4">
          {cases.map((c, i) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition">
              <button onClick={() => setExpanded(expanded === i ? -1 : i)} className="w-full text-left p-6 flex items-center gap-4">
                <span className={`flex items-center justify-center w-10 h-10 rounded-lg text-white text-sm font-bold font-mono shrink-0 ${c.risk >= 75 ? 'bg-red-500' : c.risk >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                  {c.risk}%
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900">{c.title}</h3>
                  <p className="text-sm text-slate-500">{c.blocks}</p>
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Scenario #{c.id}</span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${expanded === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {expanded === i && (
                <div className="px-6 pb-6 border-t border-slate-100 pt-4">
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{c.desc}</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                      <p className="text-xs font-mono text-red-600 uppercase tracking-wider mb-1">Delay Driver</p>
                      <p className="text-sm text-slate-700">{c.driver}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                      <p className="text-xs font-mono text-emerald-600 uppercase tracking-wider mb-1">Recommended Intervention</p>
                      <p className="text-sm text-slate-700">{c.intervention}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Architecture() {
  const tiers = [
    { tier: 'Tier 1', title: 'Data Ingestion Layer', items: ['LACRRIS API', 'State Bhumi Records', 'e-Courts Case Dockets', 'Cadastral GIS Layers'] },
    { tier: 'Tier 2', title: 'Secure API Gateway & Auth', items: ['OAuth 2.0 / e-Pramaan SSO', 'TLS 1.3 Transport', 'IP Allowlisting'] },
    { tier: 'Tier 3', title: 'AI Inference & Explainability Engine', items: ['Ensemble XGBoost + Random Forest', 'SHAP Factor Attribution', 'Continuous Drift Monitoring'] },
    { tier: 'Tier 4', title: 'Statutory Command Portals', items: ['Collector Console', 'BDO Monitoring Queue', 'LAO Hearing Planner'] },
  ]

  return (
    <section id="architecture" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-emerald-600 uppercase tracking-widest mb-3">Technical Standards & Compliance</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">Enterprise Technical Architecture</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Built to sovereign government IT standards with ISO 27001 certified data flow pipeline.</p>
        </div>
        <div className="space-y-4">
          {tiers.map((t, i) => (
            <div key={t.tier} className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-navy-500 text-white text-xs font-bold font-mono">{t.tier}</span>
                <h3 className="font-bold text-slate-900">{t.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                {t.items.map((item) => (
                  <span key={item} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-lg">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> AES-256 In-Rest</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> MeitY Empanelled Cloud</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> WCAG 2.1 AA Compliant</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ISO 27001 Certified</span>
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  const faqs = [
    { q: 'What data sources does Parivekshan AI use?', a: 'Parivekshan AI securely connects with district land acquisition case files, LACRRIS records, the West Bengal State Bhumi portal, e-Courts case registries, and cadastral GIS layers. It also ingests milestone telemetry from nodal executing bodies like NHAI, WBHDCL, and BSF Border Works wings.' },
    { q: 'How accurate are the delay predictions?', a: 'Our ensemble gradient-boosted models currently demonstrate a verified 95% precision rate when identifying projects at risk of over 90-day delays when monitored across a 3 to 6-month predictive horizon.' },
    { q: 'Can the system integrate with our existing land records database?', a: 'Yes. Parivekshan AI provides open RESTful adaptors that sit natively on top of existing NIC database architectures, state Land & Land Reforms portals, and local CSV/Excel registries without requiring disruptive database redesigns.' },
    { q: 'Who can access the dashboards and alerts?', a: 'Access is governed under multi-tiered Role-Based Access Control (RBAC). The District Magistrate & Collector and ADM (LA) retain district-wide command oversight. Block Development Officers and LAOs view customized filtered queues mapped to their jurisdiction.' },
    { q: 'How often are the ML models retrained?', a: 'The platform executes continuous data-drift monitoring and is formally retrained every quarter against newly finalized awards, court resolutions, and actual milestone delivery dates, overseen by the District IT Cell.' },
    { q: 'Is the platform available in Bengali?', a: 'Yes. The portal features a complete bilingual interface in both English and Bengali, ensuring ease of use for field revenue inspectors, amin staff, and BDO administration.' },
  ]

  const [openFaq, setOpenFaq] = useState(-1)

  return (
    <section id="faq" className="py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-emerald-600 uppercase tracking-widest mb-3">Administrative Clarity</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} className="w-full text-left p-5 flex items-center justify-between gap-4">
                <span className="font-semibold text-slate-900 text-sm">{faq.q}</span>
                <svg className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-3">
                  <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <p className="text-xs font-mono text-emerald-600 uppercase tracking-widest mb-3">Statutory Implementation</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-6">Request a District-Level Demo</h2>
            <p className="text-slate-500 mb-8">See how Parivekshan AI can transform land acquisition monitoring in North 24 Parganas.</p>
            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-900 mb-1">District Liaison Office</p>
                <p>Office of the District Magistrate & Collector,<br/>North 24 Parganas, Barasat - 700124,<br/>West Bengal, India</p>
              </div>
              <div>
                <p className="font-mono text-emerald-600">support@parivekshan-n24p.gov.in</p>
                <p className="font-mono">+91-33-2584-XXXX / NIC Extension 204</p>
              </div>
              <p className="text-xs text-slate-400 italic">Demos are restricted to authorized government personnel, project executing agencies, and administrative stakeholders.</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input type="text" className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition" placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Official Designation *</label>
                <input type="text" className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition" placeholder="e.g., District Magistrate" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department / Office *</label>
                <select className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition">
                  <option>Select Official Authority</option>
                  <option>District Collector's Office</option>
                  <option>Block Development Office (BDO)</option>
                  <option>Land Acquisition Office (LAO)</option>
                  <option>NHAI / Executing Agency</option>
                  <option>Other State/Central Department</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Block / Mouza *</label>
                <select className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition">
                  <option>Select District Block</option>
                  <option>Basirhat I</option>
                  <option>Basirhat II</option>
                  <option>Hingalganj</option>
                  <option>Amdanga</option>
                  <option>Barasat I</option>
                  <option>Barasat II</option>
                  <option>Barrackpore</option>
                  <option>Hasnabad</option>
                  <option>Other (District-wide overview)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Official Email *</label>
                <input type="email" className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition" placeholder=".gov.in / .nic.in preferred" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile / CUG Contact *</label>
                <input type="tel" className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition" placeholder="+91" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Scope / Notes</label>
                <textarea rows={3} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition resize-none" placeholder="Describe your inquiry..." />
              </div>
              <button className="w-full px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition">
                Schedule District Demonstration
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-navy-500 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Logo className="h-12 w-auto brightness-0 invert mb-4" />
            <p className="text-sm text-navy-200 leading-relaxed">Predictive Analytics for Land Acquisition. Empowering sovereign governance through predictive machine learning.</p>
            <p className="text-xs text-navy-300 mt-3 font-mono">Node: WB-N24P-DC-01 | Secure Sandbox v4.1.2</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Statutory Links</h4>
            <ul className="space-y-2 text-sm text-navy-200">
              <li><a href="#hero" className="hover:text-white transition">About Portal</a></li>
              <li><a href="#features" className="hover:text-white transition">Command Features</a></li>
              <li><a href="#dashboard" className="hover:text-white transition">Telemetry Dashboard</a></li>
              <li><a href="#use-cases" className="hover:text-white transition">District Case Studies</a></li>
              <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Affiliations</h4>
            <ul className="space-y-2 text-sm text-navy-200">
              <li>Ministry of Rural Development, Govt of India</li>
              <li>Department of Land Resources (DoLR)</li>
              <li>Government of West Bengal — L&LR Department</li>
              <li>NIC West Bengal Collaboration</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Compliance</h4>
            <ul className="space-y-2 text-sm text-navy-200">
              <li>Aligned with RFCTLARR Act 2013</li>
              <li>ISO 27001 Certified Environment</li>
              <li>WCAG 2.1 AA Compliant</li>
              <li>MeitY Empanelled</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-navy-400/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-navy-300">© 2026 Parivekshan AI, North 24 Parganas. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-navy-300">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Use</a>
            <a href="#" className="hover:text-white transition">Cyber Security Norms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function DistrictLanding() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ContextSection />
      <HowItWorks />
      <Features />
      <DashboardPreview />
      <Impact />
      <UseCases />
      <Architecture />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  )
}
