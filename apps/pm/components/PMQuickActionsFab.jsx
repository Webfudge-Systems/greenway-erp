'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  CheckSquare,
  FolderOpen,
  Building2,
  ChevronRight,
  X,
} from 'lucide-react'
import { canWritePM, canWriteClientAccounts } from '../lib/rbac'
import { canCreateProjectsInPm } from '../lib/pmOrgRoles'

const quickActionItems = [
  {
    label: 'New Task',
    module: 'my_tasks',
    icon: CheckSquare,
    href: '/my-tasks?createTask=1',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    label: 'New Project',
    module: 'projects',
    icon: FolderOpen,
    href: '/projects/add',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    label: 'New Client',
    module: 'client_accounts',
    icon: Building2,
    href: '/clients/accounts/new',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
]

export default function PMQuickActionsFab() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  const visibleQuickActions = quickActionItems.filter((item) => {
    if (item.module === 'client_accounts') {
      if (!canWriteClientAccounts()) return false
    } else if (!canWritePM(item.module)) {
      return false
    }
    if (item.href === '/projects/add' && !canCreateProjectsInPm()) return false
    return true
  })

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
    return undefined
  }, [open])

  if (visibleQuickActions.length === 0) return null

  const handleAction = (href) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <div ref={rootRef} className="fixed bottom-5 right-5 z-[200] flex flex-col items-end gap-2">
      {open && (
        <div className="w-52 rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Quick actions
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="p-1.5">
            {visibleQuickActions.map((item) => {
              const QIcon = item.icon
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleAction(item.href)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-gray-800 transition-colors hover:bg-gray-50"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${item.bgColor} ${item.borderColor}`}
                  >
                    <QIcon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <span className="flex-1 font-medium">{item.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-xl ${
          open ? 'rotate-45' : ''
        }`}
        aria-expanded={open}
        aria-label={open ? 'Close quick actions' : 'Quick actions'}
        title="Quick actions"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>
    </div>
  )
}
