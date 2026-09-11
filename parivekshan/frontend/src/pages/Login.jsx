import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import LoginForm from '../components/auth/LoginForm'

export default function Login() {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex relative overflow-hidden bg-[#0F2C59] items-center">
        <svg
          className="absolute inset-0 h-full w-full text-white/5"
          aria-hidden="true"
        >
          <defs>
            <pattern id="topo-grid" width="56" height="56" patternUnits="userSpaceOnUse">
              <path d="M28 0L56 28L28 56L0 28Z" fill="none" stroke="currentColor" strokeWidth="0.75" />
              <circle cx="28" cy="28" r="6" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo-grid)" />
        </svg>
        <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-[#bef264]/15 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-[#10B981]/20 blur-3xl pointer-events-none"></div>

        <div className="relative max-w-md w-full mx-auto px-12 py-20 text-white">
          <Logo className="h-11 mb-10 brightness-0 invert" />
          <p className="flex items-center gap-2 font-code-xs text-code-xs text-[#bef264] uppercase tracking-[0.2em] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#bef264]"></span> National Command Portal
          </p>
          <h1 className="text-[2.35rem] leading-[1.15] font-bold tracking-tight mb-5">
            Anticipate acquisition delays{' '}
            <span className="text-[#bef264]">before they stall the nation.</span>
          </h1>
          <p className="text-white/70 text-[15px] leading-relaxed mb-10">
            Predictive decision support for District Collectorates — forecast risk, surface drivers,
            and prioritise interventions across every gazette milestone.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-mono text-white/60 uppercase tracking-wider">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#bef264]"></span> LARR Act 2013</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#bef264]"></span> NIC–GIS interoperable</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#bef264]"></span> Ministry of Rural Development</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <Logo className="h-12" />
          </div>

          <div className="bg-surface-card rounded-2xl border border-border-crisp shadow-card p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-text-primary tracking-tight">Sign in</h2>
              <p className="text-sm text-text-muted mt-1">Authorised officials only. Identity is verified against the NIC directory.</p>
            </div>

            <LoginForm />

            <p className="text-[11px] text-text-muted text-center mt-6 border-t border-border-crisp pt-4 leading-relaxed">
              Demo environment — no password is required and no data leaves your browser.
            </p>
          </div>

          <p className="text-center mt-5">
            <Link to="/" className="inline-flex items-center gap-1 text-[13px] text-primary font-medium hover:underline">
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              Back to public portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}