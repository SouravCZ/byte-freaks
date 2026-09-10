import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function AccessDenied() {
  const location = useLocation()
  const navigate = useNavigate()
  const deniedPage = location.state?.accessDenied || 'that page'

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-space-lg py-space-xl">
      <div className="rounded-2xl border border-border-crisp bg-surface-card shadow-card p-space-xl max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-risk-warning-bg text-risk-warning mb-4">
          <span className="material-symbols-outlined text-[32px]">lock</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Access denied</h1>
        <p className="text-[14px] text-text-muted mb-5 leading-relaxed">
          You do not have permission to view {deniedPage}. This view is restricted under the role-based access policy for Parivekshan AI.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Return to dashboard
          </button>
          <Link
            to="/projects"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-border-crisp text-text-primary text-sm font-semibold hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">folder</span>
            View project directory
          </Link>
        </div>
      </div>
    </div>
  )
}
