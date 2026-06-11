'use client'

import { WorkspaceLayoutContent } from '@greenways/ui'
import { usePathname } from 'next/navigation'
import PMSidebar from './PMSidebar'
import PMQuickActionsFab from './PMQuickActionsFab'
import { canReadCurrentPMPath } from '../lib/rbac'
import { PM_SITE } from '../lib/site'
import { PmDepartmentProvider, usePmDepartment } from '../context/PmDepartmentContext'

const PUBLIC_PATHS = ['/login', '/unauthorized', '/coming-soon']

function PmWorkspaceShell({ children }) {
  const pathname = usePathname()
  const { revision } = usePmDepartment()
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('auth-token'))
  const canView = isPublic || !hasToken || canReadCurrentPMPath(pathname)

  return (
    <WorkspaceLayoutContent
      sidebar={PMSidebar}
      sidebarBehavior="hide"
      sidebarBranding={{
        logoPath: PM_SITE.logoPath,
        brandName: PM_SITE.productName,
        homeHref: '/',
      }}
      appName={PM_SITE.productName}
      pwaStorageKey="pm"
      mobileNav
      mobileNavTitle={PM_SITE.productName}
      canView={canView}
      deniedTitle="Access denied"
      deniedDescription="Your current role does not have access to this Project Management module."
      extras={<PMQuickActionsFab />}
    >
      <div key={`pm-dept-${revision}`} className="min-h-0 flex flex-1 flex-col min-w-0">
        {children}
      </div>
    </WorkspaceLayoutContent>
  )
}

export default function LayoutContent({ children }) {
  return (
    <PmDepartmentProvider>
      <PmWorkspaceShell>{children}</PmWorkspaceShell>
    </PmDepartmentProvider>
  )
}
