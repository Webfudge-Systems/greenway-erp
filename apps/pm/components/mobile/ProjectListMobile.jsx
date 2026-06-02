'use client'

import Link from 'next/link'
import { ChevronRight, FolderOpen } from 'lucide-react'
import { Badge, ProgressBar } from '@greenways/ui'
import { getProjectStatusMeta } from '../PMStatusBadge'
import { MOBILE_CARD_CLASS } from './mobileCardStyles'

function formatShortDate(value) {
  if (!value) return null
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProjectListMobile({ projects, onRowClick }) {
  if (!projects.length) return null

  return (
    <div className="space-y-4 md:hidden">
      {projects.map((project) => {
        const statusMeta = getProjectStatusMeta(project.strapiStatus || project.status)
        const href = `/projects/${project.slug || project.id}`
        const progress = project.progress ?? 0
        const dueLabel = formatShortDate(project.endDate)

        return (
          <Link
            key={project.id}
            href={href}
            onClick={(event) => {
              if (onRowClick) {
                event.preventDefault()
                onRowClick(project)
              }
            }}
            className={`block ${MOBILE_CARD_CLASS} transition-colors active:bg-gray-50/80`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 shrink-0 text-brand-primary" />
                    <h3 className="truncate text-base font-semibold text-gray-900">{project.name}</h3>
                  </div>
                  {project.clientName ? (
                    <p className="mt-1 truncate text-sm text-gray-500">{project.clientName}</p>
                  ) : null}
                </div>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={statusMeta.variant} size="sm">
                  {statusMeta.label}
                </Badge>
                {dueLabel ? <span className="text-xs text-gray-500">Due {dueLabel}</span> : null}
                {project.projectManager?.name ? (
                  <span className="truncate text-xs text-gray-500">{project.projectManager.name}</span>
                ) : null}
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span className="font-semibold text-gray-700">{progress}%</span>
                </div>
                <ProgressBar value={progress} size="sm" label={false} />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
