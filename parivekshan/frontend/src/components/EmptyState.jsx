import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Reusable empty state.
 * props: icon, title, message, action { to, label } (optional), secondary { to, label }
 */
export default function EmptyState({ icon = 'inbox', title, message, action, secondary }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-space-lg py-space-xl">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-container-low border border-border-crisp text-text-muted mb-4">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">{title || 'Nothing here yet'}</h3>
      {message && <p className="text-[13px] text-text-muted max-w-sm leading-relaxed mb-5">{message}</p>}
      {(action || secondary) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {action && (
            action.to ? (
              <Link
                to={action.to}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">{action.icon || 'arrow_forward'}</span>
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">{action.icon || 'arrow_forward'}</span>
                {action.label}
              </button>
            )
          )}
          {secondary && (
            <Link
              to={secondary.to}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border-crisp text-text-primary text-[13px] font-semibold hover:bg-surface-container transition-colors"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
