'use client'

import Image from 'next/image'
import Link from 'next/link'
import { PanelLeftOpen } from 'lucide-react'

/**
 * Slim top bar shown when the sidebar is fully hidden.
 */
export function WorkspaceTopBar({ onOpenSidebar, branding }) {
  return (
    <div className="z-30 flex shrink-0 items-center gap-0.5 border-b border-gray-100 bg-white px-3 py-2">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-50"
        aria-label="Open sidebar"
      >
        <PanelLeftOpen className="h-5 w-5" strokeWidth={1.75} />
      </button>
      {branding?.logoPath ? (
        <Link
          href={branding.homeHref || '/'}
          className="ml-1 flex min-w-0 items-center gap-2"
          aria-label={branding.brandName ? `${branding.brandName} home` : 'Home'}
        >
          <Image
            src={branding.logoPath}
            alt={branding.brandName || 'Logo'}
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 object-contain"
          />
          {branding.brandName ? (
            <span className="hidden truncate text-sm font-semibold text-gray-900 sm:block">
              {branding.brandName}
            </span>
          ) : null}
        </Link>
      ) : null}
    </div>
  )
}

export default WorkspaceTopBar
