import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const NAV = [
  { label: 'Home', href: '#hero' },
  { label: 'Context', href: '#context' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Impact', href: '#impact' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

const MARQUEE = [
  'Bharatmala Pariyojana II',
  'Dedicated Freight Corridor (DFC)',
  'LWE Integrated Road Projects',
  'National Highways Development Programme (NHDP)',
  'PMGSY III (Pradhan Mantri Gram Sadak Yojana)',
  'Sagarmala Coastal Connectivity',
]

const ALLOCATION = '$18,00,000 Cr',
  ALLOC_NOTE = 'Allocated under RFCTLARR-aligned acquisition pipeline (FY21–FY25)'

const CORRIDORS = [
  {
    id: 'IP-712',
    title: 'Bharatmala Pariyojana',
    band: 'Med Risk',
    bandCls: 'bg-amber-50 text-amber-600 border-amber-100',
    desc: '5,940 km surface corridor. Slowing consent orders at two northern states and compensation gap widening near LWE zone.',
    status: 'In Progress',
    statusDot: 'bg-emerald-500',
  },
  {
    id: 'IP-908',
    title: 'Dedicated Freight Corridor',
    band: 'High Risk',
    bandCls: 'bg-rose-50 text-rose-600 border-rose-100',
    desc: '2,804 km network across six states. Revenue-land ROIs and forest parcel clearances running 14+ months behind statutory window.',
    status: 'In Progress',
    statusDot: 'bg-rose-500',
  },
  {
    id: 'IP-451',
    title: 'LWE Integrated Road Projects',
    band: 'Low Risk',
    bandCls: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    desc: '3,422 km of left-wing extremism road connectivity. Compensation disbursals on-pace; two pending award notifications.',
    status: 'In Progress',
    statusDot: 'bg-emerald-500',
  },
]

const STAGES = [
  { num: '01', tag: 'Land', title: 'Acquire, terrain, encumbrance', desc: 'Boundary, possession, and encumbrance status folded in from statutory sources per parcel.' },
  { num: '02', tag: 'Baseline', title: 'Aggregate into a national baseline', desc: 'Acquisition status is reconciled into a single national land-acquisition baseline by corridor and district.' },
  { num: '03', tag: 'Model', title: 'Risk-band every project', desc: 'Our AI engine scores every project for delay, compensation, and statutory risk using RFCTLARR stage context.' },
  { num: '04', tag: 'Monitor', title: 'Daily ingestion of progress figures', desc: 'Notifications, awards, and compensation disbursals are ingested daily and matched to pipeline stages.' },
  { num: '05', tag: 'Alert', title: 'Watch-flagged projects surface immediately', desc: 'Breaching statutory timelines or compensation norms auto-flag to collectorate and ministry dashboards.' },
  { num: '06', tag: 'Report', title: 'Export-ready briefs', desc: 'One-click briefs for state and central review, formatted for ministerial sign-off.' },
]

const FEATURES = [
  { icon: 'target', title: 'Acquisition Risk Scoring', desc: 'Project-level risk bands from statutory, compensation, and geospatial inputs — refreshed daily.' },
  { icon: 'file', title: 'Notification & Gazettes', desc: 'Section 11/19/3G notifications tracked against gazette dates and reply windows.' },
  { icon: 'map', title: 'District & Corridor Roll-ups', desc: 'District-to-corridor aggregation in one view; drill into any parcel group.' },
  { icon: 'gavel', title: 'RFCTLARR Statute Mapping', desc: 'Every stage mapped to RFCTLARR 2013, NH Act 1956, and relevant state acquisition rules.' },
  { icon: 'refresh', title: 'Daily Progress Ingestion', desc: 'Federated spreadsheets and MIS extracts become a live, reconciled pipeline.' },
  { icon: 'clock', title: 'Delay Attribution', desc: 'Each delay traced to consent, awards, or compensation backend with dated evidence.' },
  { icon: 'bell', title: 'Custom Alerting', desc: 'Configure threshold alerts to collectorate, PMO, or ministry desks.' },
  { icon: 'download', title: 'Export & Report Builder', desc: 'Compose PDF and Excel packs compliant with government reporting headers.' },
  { icon: 'layers', title: 'Consent & Compensation Ledger', desc: 'Per-parcel consent % and disbursal ledger, audit-ready and immutable.' },
]

const FALLBACKS = {
  impact: [
    { value: '32%', unit: 'avg. acquisition delay reduction', note: 'modeled across pilot districts' },
    { value: '42', unit: 'active districts', note: 'national rollout footprint' },
    { value: '₹1.8 Lakh Cr', unit: 'tracked compensation pipeline', note: 'notifications–disbursal closed loop' },
    { value: '94.8%', unit: 'model accuracy', note: 'weighted macro-F1 on hold-out' },
  ],
}

const USE_CASES = [
  {
    chip: 'STATE-WIDE',
    chipCls: 'bg-[#0F2C59] text-[#bef264]',
    title: 'State-wide expansion programme',
    metric: '220 acquisitions · 42 districts',
    desc: 'Big-ticket tollway corridors across two budget cycles. Collectorates needed a single yardstick for risk, compensation, and consent.',
    status: 'Monthly Review →',
    statusCls: 'text-emerald-700',
  },
  {
    chip: 'DISTRICT',
    chipCls: 'bg-rose-50 text-rose-700',
    title: 'High-risk flagged district',
    metric: 'Priority-1 · DFC corridor',
    desc: 'A district with 23 stalled awards and means-of-navigation disputes. Daily ingestion surfaced the five parcels stalling the trail.',
    status: 'Resolved in 60 days →',
    statusCls: 'text-emerald-700',
  },
  {
    chip: 'CORRIDOR',
    chipCls: 'bg-sky-50 text-sky-700',
    title: 'Greenfield freight corridor',
    metric: '2,804 km network · 6 states',
    desc: 'Multi-state statutory notifications and consent orders tracked across 42 districts from first notice to possession.',
    status: 'Quarterly Review →',
    statusCls: 'text-emerald-700',
  },
  {
    chip: 'LOCAL',
    chipCls: 'bg-amber-50 text-amber-700',
    title: 'Single-district urban bypass',
    metric: '26 km spur · 1 district',
    desc: 'A narrow urban acquisition with contested parcels. Compensation ledger resolved the roadblock before the award date.',
    status: 'Completed →',
    statusCls: 'text-emerald-700',
  },
]

const REVIEWS = [
  {
    quote: 'Finally, the RFCTLARR numbers exit the spreadsheet and enter a decision.',
    name: 'Sandeep Mehta',
    role: 'District Collector, Moradabad',
    initials: 'SM',
    color: 'bg-[#0F2C59]',
  },
  {
    quote: 'We walked into the first review with the compensation lag map pre-loaded.',
    name: 'Anjali Kulkarni',
    role: 'Joint Director, Land Acquisition',
    initials: 'AK',
    color: 'bg-emerald-600',
  },
  {
    quote: 'It does not feel like a pilot anymore — the alerting survived our Monday meetings.',
    name: 'Col. Rajeev Menon (Retd.)',
    role: 'PMO Lead, NHIDCL',
    initials: 'RM',
    color: 'bg-[#111625]',
  },
]

const TEAM = [
  { name: 'Vanya Sharma', role: 'ML Lead', bio: 'Twelve years at the seam of statutory data and predictive tools.', initials: 'VS', color: 'bg-[#0F2C59]' },
  { name: 'Arjun Bhatt', role: 'Systems & Analytics', bio: 'Former MoRD MIS architect. Owns the national baseline.', initials: 'AB', color: 'bg-emerald-600' },
  { name: 'Rhea Kapoor', role: 'Design & Research', bio: 'Field interviews across 42 districts shaped every screen.', initials: 'RK', color: 'bg-amber-500' },
  { name: 'Kabir Anand', role: 'Engineering', bio: 'Builds the ingestion pipelines that keep districts honest.', initials: 'KA', color: 'bg-[#111625]' },
]

const FAQS = [
  {
    q: 'Does Parivekshan AI replace our existing land records software?',
    a: 'No. It sits alongside your RoR, e-Bhulekh, and MIS tools and consumes their exports. Think of it as a decision-support layer — risk banding, delay attribution, and ministerial briefs on top of what already exists.',
  },
  {
    q: 'How does the risk model stay honest as projects change?',
    a: 'Every week, delayed-stage, paid, and re-notified projects are re-validated against statutory windows. Accuracy is recomputed on hold-out data as the ingestion corpus grows — the model, not the dashboard, is re-tuned.',
  },
  {
    q: 'What does a "Med risk" band actually mean on the ground?',
    a: 'A project is banded from statutory context: window slippage depth, compensation gap percentage, and dispute exposure. Bands feed your daily queue, so collectorates act on the same language the ministry reviews.',
  },
  {
    q: 'Can our collectorate export briefs for ministry submission?',
    a: 'Yes. Export-ready PDF and Excel packs are generated with standard government reporting headers, ready to attach to DPR / MIS submissions with a click.',
  },
  {
    q: 'How long does onboarding take?',
    a: 'A typical district goes live in under three weeks: two ingestion calls, one data mapping, and a workshop for the collectorate desk. Corridor-level roll-outs follow state-by-state.',
  },
]

const ICONS = {
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h5" />
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" />
      <path d="M9 3v15M15 6v15" />
    </svg>
  ),
  gavel: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M14 13l-8 8M3 21l4-4M14 13l6-6-3-3-6 6M9 7l4-4 6 6-4 4" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  ),
  layers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 2l9 5-9 5-9-5 9-5z" />
      <path d="M3 12l9 5 9-5" />
      <path d="M3 17l9 5 9-5" />
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  arrowUpRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  ),
  arrowRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  quote: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M3 21c3 0 5-2 5-5v-2H3v-4h5V5h4c0 6-1.5 10-5 14l-4 2zm13 0c3 0 5-2 5-5v-2h-5v-4h5V5h4c0 6-1.5 10-5 14l-4 2z" transform="scale(0.9) translate(1 0)" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 6L2 7" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  print: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
}

export default function Portal() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [demoSent, setDemoSent] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const submitDemo = (e) => {
    e.preventDefault()
    setDemoSent(true)
    e.target.reset()
    setTimeout(() => setDemoSent(false), 8000)
  }

  return (
    <div className="portal-landing min-h-screen bg-brandCream font-inter text-[#0F2C59] antialiased">
      <Header scrolled={scrolled} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} onPrint={() => window.print()} />

      <main className="relative z-[1]">
        <Hero />
        <Marquee />
        <Context />
        <HowItWorks />
        <Features />
        <DashboardPreview />
        <ImpactMetrics />
        <UseCases />
        <ReviewsAndTeam />
        <QuoteBand />
        <Faq openFaq={openFaq} setOpenFaq={setOpenFaq} />
        <Contact submitDemo={submitDemo} demoSent={demoSent} />
      </main>

      <Footer />

      <Link
        to="/login"
        className="portico-no-print fixed bottom-6 right-6 z-[200] hidden items-center gap-2 rounded-full bg-[#0F2C59] px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#bef264] shadow-[0_18px_40px_-10px_rgba(15,44,89,0.55)] transition hover:bg-[#111625] sm:flex"
      >
        Book a demo
        {ICONS.arrowUpRight}
      </Link>
    </div>
  )
}

function Header({ scrolled, mobileOpen, setMobileOpen, onPrint }) {
  return (
    <header
      className={`portico-no-print fixed left-0 right-0 top-0 z-[150] transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-[#111625]/90 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.6)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#hero" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F2C59] text-[#bef264]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M3 21V3l4 4 4-4 4 4 4-4v18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-[13px] font-bold uppercase tracking-[0.03em] text-white">Parivekshan AI</span>
            <span className="block text-[9px] font-medium uppercase tracking-[0.06em] text-white/55">Infrastructure Decision Support</span>
          </span>
        </a>

        <ul className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70 transition hover:text-[#bef264]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            onClick={onPrint}
            className="portico-no-print hidden h-9 items-center gap-2 rounded-full border border-white/15 px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/80 transition hover:border-white/40 hover:text-white xl:flex"
          >
            {ICONS.print}
            Print brief
          </button>

          <Link
            to="/login"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#bef264] bg-[#0F2C59] text-[#bef264] transition hover:bg-[#16244a]"
            aria-label="Log in"
          >
            {ICONS.arrowUpRight}
          </Link>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? ICONS.close : ICONS.menu}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#111625]/95 px-4 pb-5 pt-2 backdrop-blur-xl lg:hidden">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/5"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/login" className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#bef264] px-3 py-2.5 text-sm font-bold text-[#0F2C59]">
                Log In
                {ICONS.arrowUpRight}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

function Hero() {
  return (
    <section id="hero" className="scroll-mt-24 px-4 pb-0 pt-24 sm:px-6 lg:px-8 lg:pt-28">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-[#0F2C59] shadow-[0_30px_80px_-30px_rgba(15,44,89,0.6)]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1800&q=80&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F2C59]/95 via-[#122d5c]/90 to-[#0b1c38]/95" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(190,242,100,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(190,242,100,0.5) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />

        <div className="relative z-10 flex flex-col gap-8 px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#bef264]/30 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#bef264] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#bef264]" />
              PM Gati Shakti · RFCTLARR 2013 · MoRD
            </span>
          </div>

          <h1 className="max-w-3xl text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl lg:text-[64px]">
            National land records,
            <br />
            put to <span className="text-[#bef264]">foresight.</span>
          </h1>

          <p className="max-w-2xl text-balance text-[15px] leading-[1.7] text-white/70 sm:text-base">
            Parivekshan AI maps four decades of land acquisition, payment, and notification filings into decision-ready briefs
            for District Collectors and infrastructure ministries — before delays become defaults.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full bg-[#bef264] px-6 py-3 text-[13px] font-bold text-[#0F2C59] shadow-[0_14px_30px_-12px_rgba(190,242,100,0.7)] transition hover:bg-[#d0f581]"
            >
              Request National Demo
              <span className="transition-transform group-hover:translate-x-0.5">{ICONS.arrowRight}</span>
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[13px] font-bold text-white transition hover:border-white/60 hover:bg-white/5"
            >
              How it works
            </a>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-4 border-t border-white/10 pt-8 sm:grid-cols-4">
            {[
              ['32%', 'avg. delay reduction'],
              ['42', 'active districts'],
              ['12,500+', 'projects monitored'],
              ['94.8%', 'model accuracy'],
            ].map(([v, label]) => (
              <div key={label}>
                <p className="text-2xl font-extrabold tracking-[-0.02em] text-white sm:text-3xl">{v}</p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-white/50">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Marquee() {
  const row = [...MARQUEE, ...MARQUEE]
  return (
    <div className="portico-no-print relative z-[1] mt-6 overflow-hidden border-y border-[#0F2C59]/10 bg-white/60 py-4 backdrop-blur">
      <div className="portico-marquee flex w-max items-center gap-10 whitespace-nowrap">
        {row.map((name, i) => (
          <span key={i} className="flex items-center gap-10 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0F2C59]/50">
            {name}
            <span className="ml-10 inline-block h-1.5 w-1.5 rotate-45 rounded-[2px] bg-[#bef264]" />
          </span>
        ))}
      </div>
    </div>
  )
}

function SectionPill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#0F2C59]/15 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0F2C59]">
      <span className="h-1.5 w-1.5 rounded-full bg-brandEmerald" />
      {children}
    </span>
  )
}

function Context() {
  return (
    <section id="context" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <SectionPill>Context & Problem</SectionPill>
          <h2 className="mt-6 text-balance text-3xl font-extrabold leading-[1.12] tracking-[-0.02em] text-[#0F2C59] sm:text-4xl lg:text-[44px]">
            ₹18.06 Lakh Crore of infrastructure sits in land-related limbo.
          </h2>
          <p className="mt-5 text-balance text-[15px] leading-[1.75] text-[#0F2C59]/60">
            Land acquisition is the quiet bottleneck on almost every national corridor. Notifications stall, consent rounds
            slip, compensation gaps widen — and the collectorate only finds out at the review meeting.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-3xl bg-[#111625] p-8 text-white lg:row-span-2">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#bef264]/10 blur-3xl" />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.14em] text-[#bef264]">Stuck capital</p>
            <p className="relative mt-4 text-5xl font-extrabold tracking-[-0.03em] sm:text-6xl">₹1.8 Lakh Cr</p>
            <p className="relative mt-4 text-sm leading-[1.7] text-white/55">
              of national investment is currently stuck in acquisition and approval backlogs — enough to fund a new DFI round
              every quarter.
            </p>
            <div className="relative mt-8 space-y-4 border-t border-white/10 pt-6">
              {[
                ['12,500+', 'projects in pipeline'],
                ['38', 'districts flagged high-risk'],
                ['2–4 yrs', 'typical notification slippage'],
              ].map(([v, l]) => (
                <div key={l} className="flex items-baseline justify-between gap-4">
                  <span className="text-lg font-extrabold text-white">{v}</span>
                  <span className="text-right text-[11px] uppercase tracking-[0.08em] text-white/45">{l}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#0F2C59]/10 bg-white p-7 lg:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0F2C59]/50">Operational choices on the ground</p>
            <p className="mt-2 text-lg font-bold leading-snug text-[#0F2C59]">
              Every corridor is a different fight — the dashboard has to be one.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {CORRIDORS.map((c) => (
                <div key={c.id} className="group flex flex-col rounded-2xl border border-[#0F2C59]/10 bg-brandCream p-5 transition hover:border-[#bef264]/60 hover:shadow-[0_16px_30px_-20px_rgba(15,44,89,0.4)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0F2C59]/40">{c.id}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] ${c.bandCls}`}>
                      {c.band}
                    </span>
                  </div>
                  <p className="mt-3 text-[15px] font-extrabold tracking-[-0.01em] text-[#0F2C59]">{c.title}</p>
                  <p className="mt-2 flex-1 text-[12px] leading-[1.6] text-[#0F2C59]/55">{c.desc}</p>
                  <div className="mt-4 flex items-center gap-2 border-t border-[#0F2C59]/10 pt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0F2C59]/60">
                    <span className={`h-1.5 w-1.5 rounded-full ${c.statusDot}`} />
                    {c.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <SectionPill>How it works</SectionPill>
          <h2 className="mt-6 text-balance text-3xl font-extrabold leading-[1.12] tracking-[-0.02em] text-[#0F2C59] sm:text-4xl lg:text-[44px]">
            From ground to decision in six deliberate stages.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((s) => (
            <div
              key={s.num}
              className="group relative overflow-hidden rounded-3xl border border-[#0F2C59]/10 bg-brandCream p-7 transition hover:border-[#bef264]/70 hover:bg-white hover:shadow-[0_26px_50px_-28px_rgba(15,44,89,0.45)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold tracking-[0.12em] text-[#0F2C59]/40">{s.num}</span>
                <span className="rounded-full bg-[#0F2C59] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#bef264]">
                  {s.tag}
                </span>
              </div>
              <p className="mt-5 text-lg font-extrabold leading-snug tracking-[-0.01em] text-[#0F2C59]">{s.title}</p>
              <p className="mt-2 text-[13px] leading-[1.65] text-[#0F2C59]/55">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <SectionPill>Features</SectionPill>
          <h2 className="mt-6 text-balance text-3xl font-extrabold leading-[1.12] tracking-[-0.02em] text-[#0F2C59] sm:text-4xl lg:text-[44px]">
            Decision-support, built for field realities.
          </h2>
          <p className="mt-5 text-balance text-[15px] leading-[1.75] text-[#0F2C59]/60">
            No more waiting for the quarterly MIS. Every collectorate desk runs on today&apos;s land pipeline.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-3xl border border-[#0F2C59]/10 bg-white p-7 transition hover:-translate-y-1 hover:border-[#bef264]/70 hover:shadow-[0_26px_50px_-28px_rgba(15,44,89,0.4)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef7dd] text-[#3e7d0d] transition group-hover:bg-[#bef264] group-hover:text-[#0F2C59]">
                {ICONS[f.icon]}
              </div>
              <p className="mt-5 text-[16px] font-extrabold tracking-[-0.01em] text-[#0F2C59]">{f.title}</p>
              <p className="mt-2 text-[13px] leading-[1.65] text-[#0F2C59]/55">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DashboardPreview() {
  return (
    <section id="dashboard" className="scroll-mt-24 bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <SectionPill>Dashboard preview</SectionPill>
          <h2 className="mt-6 text-balance text-3xl font-extrabold leading-[1.12] tracking-[-0.02em] text-[#0F2C59] sm:text-4xl lg:text-[44px]">
            One pane across the national network.
          </h2>
          <p className="mt-5 text-balance text-[15px] leading-[1.75] text-[#0F2C59]/60">
            The acquisition command center — live across every active corridor and district.
          </p>
        </div>

        <div className="relative mx-auto mt-14 max-w-5xl">
          <div className="absolute -inset-3 rounded-[36px] bg-gradient-to-br from-[#bef264]/40 via-transparent to-[#10B981]/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-3xl border border-[#0F2C59]/10 bg-[#111625] shadow-[0_50px_100px_-40px_rgba(15,44,89,0.55)]">
            <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3.5">
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </span>
              <span className="ml-3 rounded-md bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">
                Parivekshan AI · Overview
              </span>
            </div>

            <div className="aspect-[16/9] bg-[#0F2C59] p-4 sm:p-6">
              <div className="grid h-full grid-cols-12 gap-3">
                <div className="col-span-3 hidden flex-col gap-3 sm:flex">
                  <div className="flex-1 rounded-xl bg-[#122d5c] p-3">
                    <div className="h-1.5 w-3/4 rounded bg-white/15" />
                    <div className="mt-4 h-1.5 w-1/2 rounded bg-[#bef264]/40" />
                    <div className="mt-1.5 h-1.5 w-1/2 rounded bg-white/10" />
                    <div className="mt-4 h-1.5 w-1/2 rounded bg-[#10B981]/40" />
                    <div className="mt-1.5 h-1.5 w-2/3 rounded bg-white/10" />
                  </div>
                  <div className="flex-1 rounded-xl bg-[#122d5c] p-3">
                    <div className="h-1.5 w-1/2 rounded bg-white/15" />
                    <div className="mt-4 h-1.5 w-2/3 rounded bg-[#F59E0B]/40" />
                    <div className="mt-1.5 h-1.5 w-1/3 rounded bg-white/10" />
                  </div>
                </div>

                <div className="col-span-7 flex flex-col gap-3 sm:col-span-6">
                  <div className="grid flex-1 grid-cols-3 gap-3">
                    {[
                      ['High Risk', 12, 'bg-[#EF4444]'],
                      ['Med Risk', 26, 'bg-[#F59E0B]'],
                      ['On Track', 61, 'bg-[#10B981]'],
                    ].map(([l, n, c]) => (
                      <div key={l} className="flex flex-col justify-between rounded-xl bg-[#122d5c] p-3">
                        <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-white/45">{l}</span>
                        <span className="text-xl font-extrabold text-white">{n}</span>
                        <span className={`h-1 rounded-full ${c}`} />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 rounded-xl bg-[#122d5c] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-white/45">Compensation pipeline</span>
                      <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#bef264]">₹1.8 Lakh Cr</span>
                    </div>
                    <div className="mt-3 flex h-12 items-end gap-1.5">
                      {[35, 50, 42, 66, 54, 78, 62, 88, 72, 95, 80, 70].map((h, i) => (
                        <div key={i} className={`w-full rounded-t ${i === 9 ? 'bg-[#bef264]' : 'bg-[#10B981]/50'}`} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-span-2 flex-col gap-3 hidden sm:flex">
                  <div className="flex-1 rounded-xl bg-[#F59E0B]/15 p-3">
                    <div className="h-1.5 w-2/3 rounded bg-[#F59E0B]/60" />
                    <div className="mt-3 text-[9px] font-bold uppercase tracking-[0.08em] text-[#F59E0B]">28 alerts</div>
                  </div>
                  <div className="flex-1 rounded-xl bg-[#EF4444]/15 p-3">
                    <div className="h-1.5 w-2/3 rounded bg-[#EF4444]/60" />
                    <div className="mt-3 text-[9px] font-bold uppercase tracking-[0.08em] text-[#EF4444]">7 critical</div>
                  </div>
                  <div className="flex-1 rounded-xl bg-[#10B981]/15 p-3">
                    <div className="h-1.5 w-2/3 rounded bg-[#10B981]/60" />
                    <div className="mt-3 text-[9px] font-bold uppercase tracking-[0.08em] text-[#10B981]">61 on-track</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">
                <span className="h-2 w-2 rounded-full bg-[#bef264] shadow-[0_0_10px_#bef264]" />
                Live · 42 districts
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">Last sync 08:41 IST</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ImpactMetrics() {
  return (
    <section id="impact" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <SectionPill>Impact</SectionPill>
          <h2 className="mt-6 text-balance text-3xl font-extrabold leading-[1.12] tracking-[-0.02em] text-[#0F2C59] sm:text-4xl lg:text-[44px]">
            Measured the only way collectors trust.
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {FALLBACKS.impact.map((s) => (
            <div key={s.unit} className="rounded-3xl border border-[#0F2C59]/10 bg-white p-7">
              <p className="text-3xl font-extrabold tracking-[-0.02em] text-[#0F2C59] sm:text-4xl">{s.value}</p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0F2C59]/60">{s.unit}</p>
              <p className="mt-1 text-[11px] text-[#0F2C59]/45">{s.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function UseCases() {
  return (
    <section id="use-cases" className="scroll-mt-24 bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_420px]">
          <div>
            <SectionPill>Use cases</SectionPill>
            <h2 className="mt-6 text-balance text-3xl font-extrabold leading-[1.12] tracking-[-0.02em] text-[#0F2C59] sm:text-4xl lg:text-[44px]">
              From state-wide lanes to single-district hauls — the same engine.
            </h2>
          </div>
          <p className="text-balance text-[15px] leading-[1.75] text-[#0F2C59]/60">
            Four deployments, one platform. Parivekshan AI scales from a 2,804 km multi-state network down to a 26 km urban
            spur without changing the collectorate&apos;s daily workflow.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {USE_CASES.map((u) => (
            <div key={u.title} className="group flex flex-col rounded-3xl border border-[#0F2C59]/10 bg-brandCream p-7 transition hover:border-[#bef264]/70 hover:bg-white hover:shadow-[0_26px_50px_-28px_rgba(15,44,89,0.4)]">
              <div className="flex items-center justify-between gap-3">
                <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${u.chipCls}`}>
                  {u.chip}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#0F2C59]/40">{u.metric}</span>
              </div>
              <p className="mt-5 text-lg font-extrabold tracking-[-0.01em] text-[#0F2C59]">{u.title}</p>
              <p className="mt-2 flex-1 text-[13px] leading-[1.65] text-[#0F2C59]/55">{u.desc}</p>
              <p className={`mt-5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] ${u.statusCls}`}>
                {u.status}
                {ICONS.arrowRight}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Avatar({ initials, color, size = 'h-11 w-11' }) {
  return (
    <span className={`flex items-center justify-center rounded-full text-[11px] font-bold text-[#bef264] ${color} ${size}`}>
      {initials}
    </span>
  )
}

function ReviewsAndTeam() {
  return (
    <section id="reviews-and-team" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <SectionPill>Reviews & Team</SectionPill>
          <h2 className="mt-6 text-balance text-3xl font-extrabold leading-[1.12] tracking-[-0.02em] text-[#0F2C59] sm:text-4xl lg:text-[44px]">
            Practitioners in the loop, not just in spirit.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <div key={r.name} className="flex flex-col rounded-3xl border border-[#0F2C59]/10 bg-white p-7">
              <div className="flex items-center justify-between">
                <span className="text-[#bef264]">{ICONS.quote}</span>
                <span className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24" fill="#F59E0B" className="h-3.5 w-3.5">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                    </svg>
                  ))}
                </span>
              </div>
              <p className="mt-4 flex-1 text-[15px] font-semibold leading-[1.6] text-[#0F2C59]">&quot;{r.quote}&quot;</p>
              <div className="mt-6 flex items-center gap-3 border-t border-[#0F2C59]/10 pt-5">
                <Avatar initials={r.initials} color={r.color} />
                <div>
                  <p className="text-sm font-extrabold text-[#0F2C59]">{r.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.06em] text-[#0F2C59]/50">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0F2C59]/40">The team</p>
          <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {TEAM.map((t) => (
              <div key={t.name} className="flex flex-col items-center rounded-3xl border border-[#0F2C59]/10 bg-white p-6 text-center">
                <Avatar initials={t.initials} color={t.color} size="h-14 w-14 text-[13px]" />
                <p className="mt-4 text-sm font-extrabold text-[#0F2C59]">{t.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brandEmeraldDark">{t.role}</p>
                <p className="mt-2 text-[12px] leading-[1.6] text-[#0F2C59]/50">{t.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function QuoteBand() {
  return (
    <section className="portico-no-print px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[32px] bg-gradient-to-br from-[#0F2C59] via-[#122d5c] to-[#0b1c38] px-8 py-16 text-center sm:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#bef264]">Parivekshan AI</p>
        <blockquote className="mx-auto mt-6 max-w-3xl text-balance text-2xl font-extrabold leading-[1.3] tracking-[-0.01em] text-white sm:text-3xl">
          &quot;The best plans are the ones on watermarked briefs — signed before the corridor ever breaks ground.&quot;
        </blockquote>
        <p className="mt-6 text-sm text-white/50">— Internal design principle</p>
      </div>
    </section>
  )
}

function Faq({ openFaq, setOpenFaq }) {
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <SectionPill>FAQ</SectionPill>
          <h2 className="mt-6 text-balance text-3xl font-extrabold leading-[1.12] tracking-[-0.02em] text-[#0F2C59] sm:text-4xl">
            Questions, answered straight.
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => {
            const open = openFaq === i
            return (
              <div
                key={f.q}
                className={`overflow-hidden rounded-2xl border transition ${
                  open ? 'border-[#bef264]/70 bg-white shadow-[0_20px_40px_-28px_rgba(15,44,89,0.4)]' : 'border-[#0F2C59]/10 bg-white'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={open}
                >
                  <span className="text-[15px] font-bold text-[#0F2C59]">{f.q}</span>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${open ? 'rotate-45 bg-[#bef264] text-[#0F2C59]' : 'bg-[#0F2C59]/5 text-[#0F2C59]'}`}>
                    {ICONS.plus}
                  </span>
                </button>
                {open && (
                  <div className="border-t border-[#0F2C59]/10 px-6 pb-5 pt-4 text-[14px] leading-[1.7] text-[#0F2C59]/60">
                    {f.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Contact({ submitDemo, demoSent }) {
  const inputCls =
    'w-full rounded-xl border border-[#0F2C59]/15 bg-white px-4 py-3 text-sm text-[#0F2C59] placeholder:text-[#0F2C59]/35 outline-none transition focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20'

  return (
    <section id="contact" className="portico-no-print scroll-mt-24 bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionPill>Contact</SectionPill>
            <h2 className="mt-6 text-balance text-3xl font-extrabold leading-[1.12] tracking-[-0.02em] text-[#0F2C59] sm:text-4xl lg:text-[44px]">
              Request a national demo.
            </h2>
            <p className="mt-5 max-w-md text-balance text-[15px] leading-[1.75] text-[#0F2C59]/60">
              Tell us which corridors, which districts, and how you would like to see it run. We bring a live national
              baseline — not a slide deck.
            </p>

            <div className="mt-10 space-y-5">
              {[
                { icon: 'mail', label: 'Email', value: 'hello@parivekshan.ai', href: 'mailto:hello@parivekshan.ai' },
                { icon: 'phone', label: 'Helpline', value: '1800 000 0000', href: 'tel:18000000000' },
                { icon: 'pin', label: 'Address', value: 'Ministry Grounds, New Delhi 110011' },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brandCream text-brandEmeraldDark">
                    {ICONS[row.icon]}
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0F2C59]/45">{row.label}</p>
                    {row.href ? (
                      <a href={row.href} className="text-[15px] font-bold text-[#0F2C59] transition hover:text-brandEmeraldDark">
                        {row.value}
                      </a>
                    ) : (
                      <p className="text-[15px] font-bold text-[#0F2C59]">{row.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              {['DFC Corridors', 'Bharatmala II', 'PMGSY III', 'State Acquisition Wings'].map((t) => (
                <span key={t} className="rounded-full border border-[#0F2C59]/10 bg-brandCream px-3 py-1.5 text-[11px] font-semibold text-[#0F2C59]/60">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={submitDemo} className="rounded-3xl border border-[#0F2C59]/10 bg-brandCream p-7 sm:p-9">
            <p className="text-lg font-extrabold text-[#0F2C59]">Book the demo</p>
            <p className="mt-1 text-[13px] text-[#0F2C59]/55">Priority is given to District Collectorates & state transport bodies.</p>

            <div className="mt-7 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="demo-name" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-[#0F2C59]/55">
                    Full name
                  </label>
                  <input id="demo-name" required name="name" className={inputCls} placeholder="A. Sharma" />
                </div>
                <div>
                  <label htmlFor="demo-email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-[#0F2C59]/55">
                    Official email
                  </label>
                  <input id="demo-email" required type="email" name="email" className={inputCls} placeholder="a.sharma@gov.in" />
                </div>
              </div>

              <div>
                <label htmlFor="demo-org" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-[#0F2C59]/55">
                  Organisation or district
                </label>
                <input id="demo-org" required name="org" className={inputCls} placeholder="NHAI / Moradabad District" />
              </div>

              <div>
                <label htmlFor="demo-use" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-[#0F2C59]/55">
                  Use case
                </label>
                <select id="demo-use" name="use" className={inputCls} defaultValue="corridor">
                  <option value="corridor">Corridor analytics (state-wide)</option>
                  <option value="district">Single-district risk banding</option>
                  <option value="compliance">RFCTLARR compliance report</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="demo-msg" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-[#0F2C59]/55">
                  Message
                </label>
                <textarea id="demo-msg" name="message" rows={4} className={`${inputCls} resize-none`} placeholder="Which corridors, which districts…" />
              </div>
            </div>

            {demoSent && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#10B981]/30 bg-[#e8f7ef] p-4 text-sm text-[#055c43]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white">
                  {ICONS.check}
                </span>
                Request received — our team will reach out within one business day.
              </div>
            )}

            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-[#0F2C59] py-3.5 text-[13px] font-bold tracking-[0.02em] text-[#bef264] transition hover:bg-[#111625]"
            >
              Request National Demo
            </button>
            <p className="mt-4 text-center text-[11px] text-[#0F2C59]/40">
              *Demo slots are limited; priority is given to District Collectorates & state transport bodies.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const cols = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Dashboard', href: '#dashboard' },
        { label: 'Impact', href: '#impact' },
        { label: 'FAQ', href: '#faq' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#context' },
        { label: 'How it Works', href: '#how-it-works' },
        { label: 'Reviews', href: '#reviews-and-team' },
        { label: 'Contact', href: '#contact' },
      ],
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Data Handling', 'Accessibility'],
    },
  ]

  return (
    <footer className="portico-no-print bg-[#111625] px-4 pb-12 pt-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F2C59] text-[#bef264]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M3 21V3l4 4 4-4 4 4 4-4v18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="leading-tight">
                <span className="block text-[13px] font-bold uppercase tracking-[0.03em]">Parivekshan AI</span>
                <span className="block text-[9px] font-medium uppercase tracking-[0.06em] text-white/45">Infrastructure Decision Support</span>
              </span>
            </div>
            <p className="mt-5 max-w-xs text-[13px] leading-[1.7] text-white/50">
              The predictive infrastructure suite for land acquisition, compensation, and statutory delay monitoring — built
              for District Collectors and ministries.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) =>
                  typeof link === 'string' ? (
                    <li key={link}>
                      <span className="cursor-default text-[13px] text-white/60">{link}</span>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <a href={link.href} className="text-[13px] text-white/60 transition hover:text-[#bef264]">
                        {link.label}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-[12px] text-white/40">© 2025 Parivekshan AI · MoRD-aligned. All rights reserved.</p>
          <p className="text-[11px] uppercase tracking-[0.1em] text-white/30">Made for District Collectors.</p>
        </div>
      </div>
    </footer>
  )
}