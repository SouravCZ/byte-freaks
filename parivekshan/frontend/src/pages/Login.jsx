import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import LoginForm from '../components/auth/LoginForm'

export default function Login() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-navy-500 relative items-center justify-center p-12">
        <div className="max-w-md w-full text-white">
          <Logo className="h-12 mb-8 brightness-0 invert" />
          <p className="text-[10px] font-mono text-navy-300 uppercase tracking-widest mb-3">District Command Portal</p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight mb-4">
            Predict Land Acquisition Delays <span className="text-emerald-400">Before They Happen</span>
          </h1>
          <p className="text-navy-200 text-sm leading-relaxed mb-8">
            AI-powered decision support for the District Collector's Office. Forecast delays, identify risk drivers, and prioritize interventions.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-mono text-navy-200 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> LARR Act 2013</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> NIC-GIS Interoperable</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Ministry of Rural Development</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-6">
            <Logo className="h-12" />
          </div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
            <h1 className="text-xl font-bold text-slate-900 mb-1">Sign in (mock — no auth)</h1>
            <p className="text-xs text-slate-400 mb-6">Dev/test gate only. Any email works.</p>

            <LoginForm />

            <p className="text-xs text-slate-300 text-center mt-6">No password, no backend call, no security.</p>
          </div>
          <p className="text-center mt-4">
            <Link to="/" className="text-xs text-navy-500 font-medium hover:underline">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}