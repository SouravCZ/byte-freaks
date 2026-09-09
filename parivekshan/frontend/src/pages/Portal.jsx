import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

const heroStats = [
  { value: '1,377', label: 'Projects Modeled', sub: 'NATIONWIDE CORRIDORS' },
  { value: '23', label: 'States Covered', sub: 'MULTI-JURISDICTION' },
  { value: '95%', label: 'Predictive Risk Scoring, Explained', sub: 'SHAP-VALIDATED MODEL' },
]

const updates = [
  { date: '14 AUG 2026', tag: 'MODEL RELEASE', title: 'XGBoost delay model v2 deployed at 86% validation accuracy', target: 'All Collectorate' },
  { date: '02 SEP 2026', tag: 'INTEGRATION', title: 'Bhulekh cadastral sync now live in 23 states', target: 'National' },
  { date: '28 AUG 2026', tag: 'FEATURE', title: 'SHAP explainability added to every project scorecard', target: 'Analog Dashboard' },
  { date: '11 SEP 2026', tag: 'DATA', title: 'e-Courts dispute registry feed expanded', target: 'Analytics' },
]

const aboutPoints = [
  'AI-powered decision support for District Collectorates and national infrastructure authorities.',
  'Forecasts land acquisition delays before they happen using gradient-boosted models.',
  'Identifies revenue litigation risk, cadastral encumbrance, and statutory bottlenecks.',
  'Sovereign-by-design: NIC-GIS interoperable, LARR Act 2013 compliant.',
]

const importantLinks = [
  { label: 'Dashboard', to: '/dashboard', real: true },
  { label: 'Projects', to: '/projects', real: true },
  { label: 'Analytics', to: '/analytics', real: true },
  { label: 'ML Projects', to: '/ml-projects', real: true },
  { label: 'Alerts', to: '/alerts', real: true },
  { label: 'Users', to: '/users', real: true },
  { label: 'Contact & Grievance', to: '#contact', real: false },
  { label: 'Help / Documentation', to: '#', real: false },
  { label: 'FAQs', to: '#', real: false },
]

export default function Portal() {
  const [activeStat, setActiveStat] = useState(0)
  const [expandedPoints, setExpandedPoints] = useState(aboutPoints.map(() => false))

  useEffect(() => {
    const t = setInterval(() => setActiveStat((a) => (a + 1) % heroStats.length), 4000)
    return () => clearInterval(t)
  }, [])

  const togglePoint = (i) =>
    setExpandedPoints((prev) => prev.map((v, idx) => (idx === i ? !v : v)))

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* 1. Utility bar */}
      <div className="bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 h-9 text-[11px] font-mono uppercase tracking-wider">
          <span className="hidden sm:inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Services Online
          </span>
          <a href="#contact" className="hover:text-emerald-300 transition">Help</a>
          <a href="#contact" className="hover:text-emerald-300 transition">Contact Us</a>
          <a href="#" className="hover:text-emerald-300 transition ml-auto hidden sm:inline">Language: English</a>
        </div>
      </div>

      {/* 2. Main header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="py-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-navy-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">P</div>
            <div className="mr-auto">
              <h1 className="text-lg sm:text-2xl font-bold text-navy-900 leading-tight">Parivekshan AI</h1>
              <p className="text-[11px] sm:text-xs font-mono text-slate-500 uppercase tracking-wider">
                Predictive Land Acquisition Delay Monitoring — National Portal
              </p>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-slate-500 font-medium">Department of Land Resources</span>
              <span className="text-[11px] text-slate-400">Govt of India · Ministry of Rural Development</span>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded hover:bg-emerald-700 transition shadow-sm"
            >
              Login
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </Link>
          </div>
        </div>
        <nav className="bg-navy-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 h-11 text-sm text-white overflow-x-auto">
            <a href="#about" className="hover:text-emerald-300 transition whitespace-nowrap">About</a>
            <a href="#updates" className="hover:text-emerald-300 transition whitespace-nowrap">What&apos;s New</a>
            <a href="#links" className="hover:text-emerald-300 transition whitespace-nowrap">Important Links</a>
            <a href="#contact" className="hover:text-emerald-300 transition whitespace-nowrap">Contact</a>
            <a href="#faqs" className="hover:text-emerald-300 transition whitespace-nowrap ml-auto whitespace-nowrap">FAQs</a>
          </div>
        </nav>
      </header>

      {/* 3. Hero stat carousel */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-300 text-xs font-mono uppercase tracking-widest rounded-full border border-emerald-500/30 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live National Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4">
              One Platform to Predict <span className="text-emerald-400">Land Acquisition Delays</span>
            </h2>
            <p className="text-navy-200 text-sm sm:text-base leading-relaxed mb-8">
              AI-powered decision support for District Collectorates and national infrastructure
              authorities. Forecast delays, identify risk drivers, and prioritize interventions
              before statutory bottlenecks emerge.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login" className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition shadow-md">
                Access the Portal
              </Link>
              <a href="#about" className="inline-flex items-center px-6 py-3 border border-white/25 text-white font-semibold rounded-lg hover:bg-white/10 transition">
                Learn More
              </a>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/15 p-8">
            <p className="text-xs font-mono text-emerald-300 uppercase tracking-widest mb-1">National Progress</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{heroStats[activeStat].value}</p>
            <p className="text-base text-navy-100 font-medium mb-1">{heroStats[activeStat].label}</p>
            <p className="text-[11px] font-mono text-navy-300 uppercase tracking-wider mb-6">{heroStats[activeStat].sub}</p>
            <div className="flex gap-2">
              {heroStats.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setActiveStat(i)}
                  aria-label={s.label}
                  className={`h-1.5 rounded-full transition-all ${i === activeStat ? 'w-8 bg-emerald-400' : 'w-3 bg-white/30'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. What's New strip */}
      <section id="updates" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-navy-900">What&apos;s New</h2>
            <a href="#updates" className="text-sm text-emerald-600 font-medium hover:underline">View all updations ›</a>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-navy-50 border-b border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-mono text-navy-700 uppercase tracking-wider">Recent Announcements</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {updates.map((u) => (
                <li key={u.title} className="px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 hover:bg-slate-50 transition">
                  <span className="text-xs font-mono text-slate-400 tabular-nums tracking-wide">{u.date}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-mono uppercase tracking-wider rounded">{u.tag}</span>
                  <span className="text-sm text-slate-700">{u.title}</span>
                  <span className="ml-auto text-[11px] font-mono text-slate-400 uppercase tracking-wider">{u.target}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. About */}
      <section id="about" className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-mono text-emerald-600 uppercase tracking-widest mb-2">About Parivekshan AI</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight mb-4">
                Predictive Land Acquisition Delay Monitoring Platform
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Parivekshan AI is a sovereign AI-powered decision support system that models land
                acquisition delays before they happen. Built for District Collectorates and national
                infrastructure authorities, it unifies cadastral, revenue, and litigation data into a
                single predictive command view.
              </p>
              <ul className="space-y-3">
                {aboutPoints.map((p, i) => (
                  <li key={p} className="border border-slate-200 bg-white rounded-lg overflow-hidden">
                    <button
                      onClick={() => togglePoint(i)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-slate-700 font-medium hover:bg-slate-50 transition text-left"
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-navy-100 text-navy-700 text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        {aboutPoints[i].split(' ').slice(0, 4).join(' ')}…
                      </span>
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform ${expandedPoints[i] ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedPoints[i] && (
                      <p className="px-4 pb-3 pl-13 text-sm text-slate-600 -mt-0.5" style={{ paddingLeft: '3.25rem' }}>
                        {p}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-navy-900 text-white rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs font-mono text-emerald-300 uppercase tracking-widest mb-3">Mission</p>
                <h3 className="text-2xl font-bold mb-4">Preemption over reaction.</h3>
                <p className="text-navy-100 text-sm leading-relaxed mb-6">
                  Reduce land acquisition time overruns on critical national infrastructure by giving
                  every Collector, SLAO, and Project Director a clear, explainable forecast of risk —
                  months before a possession milestone is reached.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
                {[
                  { k: 'LARR', v: '2013 Compliant' },
                  { k: 'NIC', v: 'GIS Interop' },
                  { k: 'XGB', v: '86% Acc.' },
                ].map((s) => (
                  <div key={s.k}>
                    <p className="text-2xl font-extrabold text-emerald-400">{s.k}</p>
                    <p className="text-[11px] font-mono text-navy-300 uppercase tracking-wider">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Important Links grid */}
      <section id="links" className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-xl font-bold text-navy-900 mb-6">Important Links</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {importantLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="flex items-center justify-between gap-3 px-4 py-4 bg-background border border-slate-200 rounded-lg hover:border-navy-400 hover:bg-navy-50 transition group"
              >
                <span className="text-sm font-medium text-slate-700 group-hover:text-navy-800">{l.label}</span>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Contact */}
      <section id="contact" className="bg-navy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-navy-900 tracking-tight mb-3">Contact Us</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              For technical support, grievance redressal, or portal assistance, reach out through the
              channels below or the portal helpdesk.
            </p>
            <div className="space-y-4">
              {[
                { label: 'Technical Helpdesk', value: 'support@parivekshan.gov.in', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                { label: 'Toll-Free', value: '1800-XXX-XXXX (Mon–Sat, 9:30am–6pm)', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                { label: 'Address', value: 'Parivekshan AI, Dept of Land Resources, New Delhi — 110001', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-navy-800 text-white flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={c.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-0.5">{c.label}</p>
                    <p className="text-sm font-medium text-navy-900">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div id="faqs" className="bg-white rounded-2xl border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-navy-900 mb-5">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {[
                { q: 'Who can access the portal?', a: 'Authorized officials of District Collectorates and national infrastructure authorities sign in through the Login button.' },
                { q: 'What data powers the risk model?', a: 'Cadastral records, revenue litigation history, and statute progress — fused through an XGBoost pipeline at 86% validation accuracy.' },
                { q: 'Is there a mobile version?', a: 'The portal is fully responsive and accessible on tablets and phones through any modern browser.' },
              ].map((f) => (
                <div key={f.q} className="border border-slate-100 rounded-lg p-4">
                  <p className="text-sm font-semibold text-slate-800 mb-1">{f.q}</p>
                  <p className="text-sm text-slate-600">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-navy-950 text-navy-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="lg:col-span-2">
              <Logo className="h-12 brightness-0 invert mb-4" />
              <p className="text-sm text-navy-300 leading-relaxed max-w-md">
                National predictive land acquisition delay monitoring platform for District
                Collectorates and infrastructure authorities.
              </p>
              <p className="text-xs text-navy-400 italic mt-3">
                In collaboration with the Department of Land Resources, Ministry of Rural Development.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Portal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-emerald-300 transition">About</a></li>
                <li><a href="#updates" className="hover:text-emerald-300 transition">What&apos;s New</a></li>
                <li><a href="#links" className="hover:text-emerald-300 transition">Important Links</a></li>
                <li><a href="/login" className="hover:text-emerald-300 transition">Login</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-300 transition">Help / Documentation</a></li>
                <li><a href="#" className="hover:text-emerald-300 transition">Grievance Cell</a></li>
                <li><a href="#" className="hover:text-emerald-300 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-300 transition">Terms of Use</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-navy-400">© 2026 Parivekshan AI. National Spatial Decision Support System.</p>
            <p className="text-[11px] font-mono text-navy-500 uppercase tracking-wider">Best viewed in Chrome / Edge · Designed for official use</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
