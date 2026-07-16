'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Avatar,
  EmptyState,
  ownerDisplayFromUser,
} from '@greenways/ui'
import {
  Activity,
  CheckCircle2,
  MessageSquare,
  Circle,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-react'
import { fetchPmActivityFeed } from '../../lib/api/pmInboxService'
import DashboardPanelShell, {
  DashboardCountBadge,
  DashboardPanelFooterLink,
} from './DashboardPanelShell'

const AVATAR_PALETTES = [
  'bg-orange-500',
  'bg-violet-500',
  'bg-blue-500',
  'bg-pink-500',
  'bg-emerald-500',
  'bg-amber-500',
]

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function avatarPalette(userId) {
  const n = Number(userId) || 0
  return AVATAR_PALETTES[Math.abs(n) % AVATAR_PALETTES.length]
}

function extractQuotedName(summary) {
  const m = String(summary || '').match(/"([^"]+)"/)
  return m ? m[1] : null
}

function actionPresentation(action, subjectType) {
  const a = String(action || 'update').toLowerCase()
  const st = String(subjectType || 'record').toLowerCase()
  const entity =
    st === 'task' ? 'task' : st === 'project' ? 'project' : 'record'

  if (a === 'create') {
    return { verb: `created the ${entity}`, Icon: Plus, iconClass: 'text-emerald-600' }
  }
  if (a === 'delete') {
    return { verb: `deleted the ${entity}`, Icon: Trash2, iconClass: 'text-red-600' }
  }
  if (a === 'comment') {
    return { verb: `commented on the ${entity}`, Icon: MessageSquare, iconClass: 'text-blue-600' }
  }
  if (a.includes('complete') || a === 'done') {
    return { verb: `completed the ${entity}`, Icon: CheckCircle2, iconClass: 'text-emerald-600' }
  }
  if (a === 'update') {
    return { verb: `updated the ${entity}`, Icon: Circle, iconClass: 'text-orange-500 fill-orange-500' }
  }
  return { verb: `${a} the ${entity}`, Icon: Pencil, iconClass: 'text-gray-500' }
}

function pmHref(row) {
  const st = String(row?.subjectType || '').toLowerCase()
  const id = row?.subjectId
  if (id == null || id === '') return null
  if (st === 'project') return `/projects/${id}`
  if (st === 'task') return `/tasks/${id}`
  return null
}

function normalizeRow(row) {
  const actor = row?.actor && typeof row.actor === 'object' ? row.actor : null
  const derived = actor ? ownerDisplayFromUser(actor) : { label: 'System', avatarFallback: '?' }
  const actorName =
    derived.label && derived.label !== 'Unassigned' ? derived.label : 'Someone'
  const { verb, Icon, iconClass } = actionPresentation(row.action, row.subjectType)
  const entityName =
    extractQuotedName(row.summary) ||
    (row.subjectType === 'task' ? 'Task' : row.subjectType === 'project' ? 'Project' : 'Record')

  return {
    id: row.id,
    actorName,
    actor,
    verb,
    entityName,
    summary: row.summary,
    createdAt: row.createdAt,
    Icon,
    iconClass,
    href: pmHref(row),
    raw: row,
  }
}

export default function DashboardActivityFeedWidget({
  className = '',
  limit = 20,
  departmentRevision = 0,
}) {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await fetchPmActivityFeed({ limit, start: 0 })
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Dashboard activity feed:', e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [load, departmentRevision])

  const rows = useMemo(() => items.map(normalizeRow), [items])

  return (
    <DashboardPanelShell
      title="Team Updates"
      subtitle="Recent task and project activity in your department"
      badge={!loading && rows.length > 0 ? <DashboardCountBadge>{rows.length}</DashboardCountBadge> : null}
      actionLabel="View all"
      onAction={() => router.push('/inbox')}
      loading={loading}
      loadingMessage="Loading updates…"
      className={className}
      footer={
        <DashboardPanelFooterLink label="Open inbox" onClick={() => router.push('/inbox')} />
      }
    >
      {rows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <EmptyState
            icon={Activity}
            title="No updates yet"
            description="Task and project changes from your team will appear here."
            className="py-0"
          />
        </div>
      ) : (
        <ul className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto overscroll-contain">
          {rows.map((row) => {
            const { Icon, iconClass } = row
            const palette = avatarPalette(row.actor?.id)
            const fallback = row.actor
              ? ownerDisplayFromUser(row.actor).avatarFallback
              : '?'

            const inner = (
              <>
                <Avatar
                  fallback={fallback}
                  alt={row.actorName}
                  size="sm"
                  className={`shrink-0 text-white ${palette}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-900">
                    <span className="font-semibold">{row.actorName}</span>{' '}
                    <span className="font-normal text-gray-700">{row.verb}</span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-500" title={row.entityName}>
                    {row.entityName}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[11px] font-medium tabular-nums text-gray-400">
                    {timeAgo(row.createdAt)}
                  </span>
                  <div className={`flex h-6 w-6 items-center justify-center rounded-md bg-gray-50 ${iconClass}`}>
                    <Icon className="h-3 w-3" aria-hidden />
                  </div>
                </div>
              </>
            )

            return (
              <li key={row.id}>
                {row.href ? (
                  <Link
                    href={row.href}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-orange-50/50"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3">{inner}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </DashboardPanelShell>
  )
}
