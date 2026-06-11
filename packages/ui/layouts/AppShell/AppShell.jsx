'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@greenways/auth'
import { Building2, Loader2, Menu } from 'lucide-react'
import { WorkspaceTopBar } from './WorkspaceTopBar'

export function AppShell({
  children,
  sidebar: Sidebar,
  loginPath = '/login',
  unauthorizedPath = '/unauthorized',
  loadingMessage = 'Loading...',
  redirectingMessage = 'Redirecting to login...',
  /** 'collapse' narrows the sidebar; 'hide' removes it entirely with a top bar to reopen. */
  sidebarBehavior = 'collapse',
  /** Shown in the top bar when sidebar is hidden (logo + label). */
  sidebarBranding,
  mobileNav = false,
  mobileNavTitle = 'Webfudge Systems',
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarHidden, setSidebarHidden] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const isHideMode = sidebarBehavior === 'hide'
  const { isAuthenticated, loading, hasStoredToken } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isLoginPage = pathname === loginPath
  const isUnauthorizedPage = pathname === unauthorizedPath
  const showShellWhileAuth =
    loading && hasStoredToken && !isLoginPage && !isUnauthorizedPage

  useEffect(() => {
    if (!loading && !isAuthenticated && !isLoginPage && !isUnauthorizedPage) {
      router.push(loginPath)
    }
  }, [isAuthenticated, loading, isLoginPage, isUnauthorizedPage, router, loginPath])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileNavOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileNavOpen])

  const handleOpenSidebar = () => {
    if (mobileNav) {
      setMobileNavOpen(true)
      return
    }
    setSidebarHidden(false)
  }

  const handleSidebarToggle = () => {
    if (isHideMode) {
      if (mobileNav && mobileNavOpen) {
        setMobileNavOpen(false)
        return
      }
      setSidebarHidden(true)
      return
    }
    setSidebarCollapsed((value) => !value)
  }

  if (loading && !showShellWhileAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <p className="text-gray-900">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  if (isLoginPage || isUnauthorizedPage) {
    return <>{children}</>
  }

  if (isAuthenticated || showShellWhileAuth) {
    const showSidebar =
      Sidebar && (!isHideMode || !sidebarHidden || (mobileNav && mobileNavOpen))
    const showTopBar = isHideMode && sidebarHidden && !(mobileNav && mobileNavOpen)

    return (
      <div className="flex h-screen flex-col overflow-hidden bg-white">
        {showTopBar ? (
          <WorkspaceTopBar onOpenSidebar={handleOpenSidebar} branding={sidebarBranding} />
        ) : null}

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {mobileNav && mobileNavOpen ? (
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              aria-label="Close navigation menu"
              onClick={() => setMobileNavOpen(false)}
            />
          ) : null}

          {showSidebar ? (
            <div
              className={
                mobileNav
                  ? `fixed inset-y-0 left-0 z-50 h-full shrink-0 transition-transform duration-300 ease-out lg:relative lg:z-auto lg:translate-x-0 ${
                      mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
                    }`
                  : 'shrink-0'
              }
            >
              <Sidebar
                collapsed={isHideMode ? false : sidebarCollapsed}
                onToggle={handleSidebarToggle}
                onMobileClose={() => setMobileNavOpen(false)}
                isMobileDrawer={mobileNav && mobileNavOpen}
                sidebarBehavior={sidebarBehavior}
              />
            </div>
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {mobileNav && !showTopBar ? (
              <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(true)}
                  className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Building2 className="h-5 w-5 shrink-0 text-brand-primary" />
                  <span className="truncate text-sm font-semibold text-gray-900">{mobileNavTitle}</span>
                </div>
              </header>
            ) : null}

            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-white">{children}</main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        <p className="text-gray-900">{redirectingMessage}</p>
      </div>
    </div>
  )
}

export default AppShell
