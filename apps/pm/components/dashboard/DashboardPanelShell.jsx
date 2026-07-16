'use client'

import { Card, Button, LoadingSpinner } from '@greenways/ui'
import { ChevronRight } from 'lucide-react'

export function DashboardCountBadge({ children }) {
  return (
    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-800">
      {children}
    </span>
  )
}

export function DashboardPanelFooterLink({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
    >
      {label}
      <ChevronRight className="h-3.5 w-3.5" aria-hidden />
    </button>
  )
}

/** Shared chrome for dashboard main-row panels (My Tasks, Deadlines, Team Updates). */
export default function DashboardPanelShell({
  title,
  subtitle,
  badge = null,
  actionLabel,
  onAction,
  footer = null,
  loading = false,
  loadingMessage = 'Loading…',
  className = '',
  bodyClassName = '',
  children,
}) {
  return (
    <Card glass padding={false} className={`flex h-full min-h-0 flex-col p-5 ${className}`}>
      <div className="mb-4 flex h-[3.25rem] shrink-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold leading-tight text-gray-900">{title}</h2>
            {badge}
          </div>
          {subtitle ? <p className="mt-1 text-xs text-gray-500">{subtitle}</p> : null}
        </div>
        {actionLabel && onAction ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAction}
            className="shrink-0 text-xs font-semibold text-orange-600 hover:text-orange-700"
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
          <LoadingSpinner size="md" message={loadingMessage} />
        </div>
      ) : (
        <div
          className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${bodyClassName}`}
        >
          {children}
          {footer ? (
            <div className="flex shrink-0 items-center justify-end border-t border-gray-100 bg-gray-50/80 px-4 py-2.5">
              {footer}
            </div>
          ) : null}
        </div>
      )}
    </Card>
  )
}
