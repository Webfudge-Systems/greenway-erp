'use client'

import Link from 'next/link'
import { Building2, ChevronRight } from 'lucide-react'
import { Badge } from '@greenways/ui'
import { MOBILE_CARD_CLASS } from './mobileCardStyles'

export default function ClientAccountListMobile({ accounts }) {
  if (!accounts.length) return null

  return (
    <div className="space-y-4 md:hidden">
      {accounts.map((account) => (
        <Link
          key={account.id}
          href={`/clients/accounts/${account.id}`}
          className={`block ${MOBILE_CARD_CLASS} transition-colors active:bg-gray-50/80`}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 shrink-0 text-brand-primary" />
                  <h3 className="truncate text-base font-semibold text-gray-900">{account.name}</h3>
                </div>
                {account.industry ? (
                  <p className="mt-1 truncate text-sm text-gray-500">{account.industry}</p>
                ) : null}
              </div>
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={account.status === 'active' ? 'success' : 'secondary'} size="sm" className="capitalize">
                {account.status || 'Unknown'}
              </Badge>
              {account.assignedTo?.name ? (
                <span className="truncate text-xs text-gray-500">{account.assignedTo.name}</span>
              ) : null}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
