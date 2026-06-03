'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  KPICard,
  Card,
  Button,
  Badge,
  KPICardsRowSkeleton,
  WidgetCardSkeleton,
  DashboardContentLoader,
  formatRelativeTime,
} from '@greenways/ui'
import {
  Users,
  ShieldCheck,
  Building2,
  UserRoundCheck,
  Clock3,
  KeyRound,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react'
import AccountsPageHeader from '../../components/AccountsPageHeader'
import {
  auditService,
  departmentsService,
  organizationService,
  rolesService,
  teamsService,
  usersService,
} from '../../lib/api'

function isUnauthorizedError(error) {
  const message = String(error?.message || '').toLowerCase()
  return (
    message.includes('http 401') ||
    message.includes('unauthorized') ||
    message.includes('missing or invalid credentials') ||
    message.includes('token expired')
  )
}

function normalizeStrapiList(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  return []
}

function getUserStatus(user) {
  if (user?.blocked) return 'suspended'
  if (user?.confirmed === false) return 'invited'
  return 'active'
}

function subscriptionAppLabel(sub) {
  const app = sub?.app
  if (!app) return null
  const raw = app?.attributes ?? app?.data?.attributes ?? app
  return raw?.name || raw?.slug || app?.name || app?.slug || null
}

function summarizeSubscriptions(subscriptions = []) {
  const labels = subscriptions.map(subscriptionAppLabel).filter(Boolean)
  const deduped = [...new Set(labels.map((s) => String(s).trim()))]
  return deduped
}

function verbFromAction(action) {
  const a = String(action || '').toLowerCase()
  if (a === 'create') return 'Created'
  if (a === 'delete') return 'Deleted'
  if (a === 'comment') return 'Comment on'
  if (a === 'update') return 'Updated'
  if (!a) return 'Activity'
  return a.charAt(0).toUpperCase() + a.slice(1)
}

function entityLabel(row) {
  const st = String(row?.subjectType || row?.entityType || '').replace(/_/g, ' ')
  return st ? st.replace(/\b\w/g, (c) => c.toUpperCase()) : 'Record'
}

function formatActivityLine(raw) {
  const row = raw?.attributes ? { id: raw.id, ...raw.attributes } : raw || {}
  const verb = verbFromAction(row.action || row.event)
  const entity = entityLabel(row)
  const name =
    row.targetName ||
    row.entityName ||
    row.subject ||
    row.summary ||
    row.title ||
    (row.subjectId != null ? `#${row.subjectId}` : '')
  const tail = name ? ` · ${String(name).slice(0, 80)}${String(name).length > 80 ? '…' : ''}` : ''
  return `${verb} ${entity}${tail}`
}

function pluralCount(n, singular, plural = `${singular}s`) {
  if (n === 0) return `No ${plural}`
  return `${n} ${n === 1 ? singular : plural}`
}

function SectionHeaderIcon({ icon: Icon }) {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 ring-1 ring-orange-100/80"
      aria-hidden
    >
      <Icon className="h-[18px] w-[18px]" />
    </span>
  )
}

function MetricTile({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 shadow-sm transition-colors hover:border-orange-100/80 hover:bg-white">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-700">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums text-gray-900">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-gray-500">{hint}</p>
    </div>
  )
}

function QuickActionLink({ label, hint, href }) {
  return (
    <Link
      href={href}
      className="group flex w-full items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/90 px-4 py-3 text-left shadow-sm transition-all hover:border-orange-200 hover:bg-orange-50/60 hover:shadow-md"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-gray-900 group-hover:text-orange-900">
          {label}
        </span>
        <span className="mt-0.5 block text-[11px] text-gray-500">{hint}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600" />
    </Link>
  )
}

function AccountsDashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <DashboardContentLoader message="Loading dashboard…" />
      <KPICardsRowSkeleton count={4} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <WidgetCardSkeleton className="lg:col-span-2" minHeight="min-h-[180px]" />
        <WidgetCardSkeleton minHeight="min-h-[280px]" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WidgetCardSkeleton minHeight="min-h-[220px]" />
        <WidgetCardSkeleton minHeight="min-h-[220px]" />
      </div>
    </div>
  )
}

export default function AccountsHome() {
  const [organizationName, setOrganizationName] = useState('Accounts')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeUsers: 0,
    rolesCount: 0,
    departmentsCount: 0,
    teamsCount: 0,
    pendingInvites: 0,
  })
  const [subscriptionsSummary, setSubscriptionsSummary] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [activityFetchFailed, setActivityFetchFailed] = useState(false)

  useEffect(() => {
    let isMounted = true

    try {
      const currentOrgId = localStorage.getItem('current-org-id')
      const rawOrganizations = localStorage.getItem('auth-organizations')
      const organizations = rawOrganizations ? JSON.parse(rawOrganizations) : []
      const selectedOrg = organizations.find((org) => String(org?.id) === String(currentOrgId))
      const cachedOrgName = selectedOrg?.name || organizations?.[0]?.name

      if (isMounted && typeof cachedOrgName === 'string' && cachedOrgName.trim()) {
        setOrganizationName(cachedOrgName.trim())
      }
    } catch (_) {}

    organizationService
      .getCurrent()
      .then((response) => {
        const orgRoot = response?.data ?? response
        const orgFlat = orgRoot?.attributes ? { ...orgRoot.attributes, id: orgRoot.id } : orgRoot
        const name =
          orgFlat?.name ||
          response?.data?.attributes?.name ||
          response?.data?.name ||
          response?.name ||
          response?.organization?.name

        if (isMounted && typeof name === 'string' && name.trim()) {
          setOrganizationName(name.trim())
        }

        const subs = orgFlat?.subscriptions || []
        if (isMounted) {
          setSubscriptionsSummary(summarizeSubscriptions(Array.isArray(subs) ? subs : []))
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setActivityFetchFailed(false)

      const [usersRes, rolesList, deptRes, teamsRes, orgRes] = await Promise.all([
        usersService.list({ sort: 'updatedAt:desc' }),
        rolesService.listForOrg(),
        departmentsService.list().catch(() => null),
        teamsService.list().catch(() => null),
        organizationService.getCurrent().catch(() => null),
      ])

      const users = normalizeStrapiList(usersRes)
      let invited = 0
      let active = 0
      users.forEach((u) => {
        const st = getUserStatus(u)
        if (st === 'invited') invited += 1
        if (st === 'active') active += 1
      })

      const departments = normalizeStrapiList(deptRes)
      const teams = normalizeStrapiList(teamsRes)

      setStats({
        activeUsers: active,
        rolesCount: Array.isArray(rolesList) ? rolesList.length : 0,
        departmentsCount: departments.length,
        teamsCount: teams.length,
        pendingInvites: invited,
      })

      if (orgRes) {
        const orgRoot = orgRes?.data ?? orgRes
        const orgFlat = orgRoot?.attributes ? { ...orgRoot.attributes, id: orgRoot.id } : orgRoot
        const nm =
          orgFlat?.name ||
          orgRes?.data?.attributes?.name ||
          orgRes?.data?.name ||
          orgRes?.name
        if (typeof nm === 'string' && nm.trim()) {
          setOrganizationName(nm.trim())
        }
        const subs = orgFlat?.subscriptions
        if (Array.isArray(subs)) {
          setSubscriptionsSummary(summarizeSubscriptions(subs))
        }
      }

      try {
        const auditResult = await auditService.list({ page: 1, pageSize: 6 })
        const rows = Array.isArray(auditResult?.rows) ? auditResult.rows : []
        setRecentActivity(rows.slice(0, 6))
        setActivityFetchFailed(false)
      } catch {
        setRecentActivity([])
        setActivityFetchFailed(true)
      }
    } catch (error) {
      if (isUnauthorizedError(error) && typeof window !== 'undefined') {
        localStorage.removeItem('auth-token')
        localStorage.removeItem('current-org-id')
        localStorage.removeItem('auth-user')
        window.location.href = '/login'
        return
      }
      console.error('Dashboard load failed', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const cards = useMemo(
    () => [
      {
        title: 'Active Users',
        value: stats.activeUsers,
        subtitle: pluralCount(stats.activeUsers, 'member'),
        icon: Users,
      },
      {
        title: 'Roles',
        value: stats.rolesCount,
        subtitle: pluralCount(stats.rolesCount, 'role'),
        icon: ShieldCheck,
      },
      {
        title: 'Departments',
        value: stats.departmentsCount,
        subtitle: pluralCount(stats.departmentsCount, 'department'),
        icon: Building2,
      },
      {
        title: 'Teams',
        value: stats.teamsCount,
        subtitle: pluralCount(stats.teamsCount, 'team'),
        icon: UserRoundCheck,
      },
    ],
    [stats]
  )

  const appAccessDescription = useMemo(() => {
    if (subscriptionsSummary.length === 0) {
      return 'No app subscriptions loaded yet. Subscribed apps appear here when billing is connected.'
    }
    const joined = subscriptionsSummary.join(', ')
    return `${joined} ${subscriptionsSummary.length === 1 ? 'is' : 'are'} assigned to this organization.`
  }, [subscriptionsSummary])

  const quickActions = useMemo(
    () => [
      { label: 'Add User', href: '/users', hint: 'Invite or add members' },
      { label: 'Manage Roles', href: '/roles', hint: 'CRM & PM permissions' },
      { label: 'Review Audit Logs', href: '/audit-logs', hint: 'Workspace timeline' },
      { label: 'Update Billing', href: '/billing', hint: 'Plans and seats' },
    ],
    []
  )

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 via-gray-50 to-slate-50/90 p-3 sm:space-y-6 sm:p-4 md:p-6">
      <AccountsPageHeader
        title={`${organizationName} Dashboard`}
        subtitle="Organization identity, access, and security overview."
        breadcrumb={[{ label: 'Dashboard', href: '/' }]}
        showSearch
      />

      {loading ? (
        <AccountsDashboardSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <KPICard key={card.title} {...card} colorScheme="orange" />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card
              variant="elevated"
              className="lg:col-span-2"
              title="Security Health"
              subtitle="Current workspace security posture and action queue"
              actions={<SectionHeaderIcon icon={Shield} />}
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <MetricTile
                  label="MFA adoption"
                  value="—"
                  hint="Not reported by the API yet. Track MFA in your IdP."
                />
                <MetricTile
                  label="Pending invites"
                  value={stats.pendingInvites}
                  hint="Users awaiting email confirmation"
                />
                <MetricTile
                  label="Open incidents"
                  value={0}
                  hint="No incidents recorded for this workspace"
                />
              </div>
            </Card>

            <Card
              variant="elevated"
              title="Quick Actions"
              subtitle="Frequently used admin actions"
              actions={<SectionHeaderIcon icon={Zap} />}
            >
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <QuickActionLink key={action.href} {...action} />
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card
              variant="elevated"
              title="Recent workspace activity"
              subtitle="Latest CRM & PM timeline entries (organization feed)"
              actions={<SectionHeaderIcon icon={Clock3} />}
            >
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50/60">
                {activityFetchFailed ? (
                  <p className="px-4 py-6 text-sm text-gray-600">
                    Could not load activity. Try again from Audit Logs.
                  </p>
                ) : recentActivity.length === 0 ? (
                  <div className="space-y-2 px-4 py-6">
                    <p className="text-sm text-gray-600">No timeline entries yet.</p>
                    <Button as={Link} href="/audit-logs" variant="ghost" size="sm" className="px-0 text-orange-600">
                      Open audit logs →
                    </Button>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {recentActivity.map((row, idx) => {
                      const flat = row?.attributes ? { id: row.id, ...row.attributes } : row
                      const at = flat?.createdAt || flat?.updatedAt || flat?.timestamp
                      return (
                        <li
                          key={flat?.id ?? idx}
                          className="flex gap-3 px-4 py-3 text-sm transition-colors hover:bg-white/80"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="leading-snug text-gray-800">{formatActivityLine(row)}</p>
                          </div>
                          <time
                            className="shrink-0 text-xs tabular-nums text-gray-500"
                            dateTime={at || undefined}
                          >
                            {at ? formatRelativeTime(at) : '—'}
                          </time>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
              {!activityFetchFailed && recentActivity.length > 0 ? (
                <div className="mt-4 flex justify-end">
                  <Button as={Link} href="/audit-logs" variant="ghost" size="sm" className="text-orange-600">
                    View all activity
                  </Button>
                </div>
              ) : null}
            </Card>

            <Card
              variant="elevated"
              title="App Access Summary"
              subtitle="Apps linked to this organization"
              actions={<SectionHeaderIcon icon={KeyRound} />}
            >
              {subscriptionsSummary.length > 0 ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {subscriptionsSummary.map((app) => (
                    <Badge key={app} variant="orange" size="md">
                      {app}
                    </Badge>
                  ))}
                </div>
              ) : null}
              <p className="text-sm leading-relaxed text-gray-700">{appAccessDescription}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button as={Link} href="/app-access" variant="outline" size="sm">
                  View app access
                </Button>
                <Button as={Link} href="/billing" variant="muted" size="sm">
                  Billing & seats
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
