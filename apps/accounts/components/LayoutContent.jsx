'use client'

import { WorkspaceLayoutContent } from '@greenways/ui'
import AccountsSidebar from './AccountsSidebar'
import { ACCOUNTS_SITE } from '../lib/site'

export default function LayoutContent({ children }) {
  return (
    <WorkspaceLayoutContent
      sidebar={AccountsSidebar}
      sidebarBehavior="hide"
      sidebarBranding={{
        logoPath: ACCOUNTS_SITE.logoPath,
        brandName: ACCOUNTS_SITE.productName,
        homeHref: '/',
      }}
      showPwa={false}
      canView={true}
    >
      {children}
    </WorkspaceLayoutContent>
  )
}
