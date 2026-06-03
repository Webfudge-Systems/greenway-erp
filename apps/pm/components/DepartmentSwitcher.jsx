'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building2, ChevronDown } from 'lucide-react'
import { authService } from '@greenways/auth'
import { listOrgDepartments } from '../lib/api/departmentService'
import { usePmDepartment } from '../context/PmDepartmentContext'

/**
 * Department context switcher — top of PM sidebar.
 * Uses membership departments from login, or loads all org departments when none assigned.
 */
export default function DepartmentSwitcher({ collapsed = false, className = '' }) {
  const { switchDepartment } = usePmDepartment()
  const [departments, setDepartments] = useState([])
  const [currentId, setCurrentId] = useState(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadDepartments = useCallback(async () => {
    setLoading(true)
    try {
      await authService.getCurrentUser()
      let list = authService.getDepartmentsForCurrentOrg()

      if (!list.length) {
        const orgId = authService.getCurrentOrgId()
        const cachedOrg = sessionStorage.getItem('pm-department-options-org')
        const cached = authService.getSwitchableDepartments()
        if (cached.length && String(cachedOrg) === String(orgId)) {
          list = cached
        } else {
          list = await listOrgDepartments()
          authService.setSwitchableDepartments(list, orgId)
        }
      } else {
        authService.setSwitchableDepartments(list)
      }

      authService.syncDepartmentForCurrentOrg()
      setDepartments(list)
      setCurrentId(authService.getCurrentDepartmentId())
    } catch (err) {
      console.warn('DepartmentSwitcher: failed to load departments', err)
      const fallback = authService.getSwitchableDepartments()
      setDepartments(fallback)
      setCurrentId(authService.getCurrentDepartmentId())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDepartments()

    const onRefresh = () => loadDepartments()
    window.addEventListener('storage', onRefresh)
    window.addEventListener('gw:department-changed', onRefresh)
    window.addEventListener('gw:org-changed', onRefresh)

    return () => {
      window.removeEventListener('storage', onRefresh)
      window.removeEventListener('gw:department-changed', onRefresh)
      window.removeEventListener('gw:org-changed', onRefresh)
    }
  }, [loadDepartments])

  const currentLabel = useMemo(() => {
    if (loading) return 'Loading…'
    const match = departments.find((d) => d.id === currentId)
    if (match?.name) return match.name
    if (departments.length === 1) return departments[0].name
    return departments.length ? 'Select department' : 'No departments'
  }, [currentId, departments, loading])

  const handleSelect = (deptId) => {
    if (!switchDepartment(deptId)) return
    setCurrentId(deptId)
    setOpen(false)
  }

  if (!loading && !departments.length) {
    return (
      <div className={`${className} ${collapsed ? 'px-2' : 'px-0'}`}>
        <div
          className={`flex items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-500 ${
            collapsed ? 'justify-center p-2' : 'px-3 py-2 text-xs'
          }`}
          title="Create departments in Accounts"
        >
          <Building2 className="h-4 w-4 shrink-0" />
          {!collapsed ? <span>No departments yet</span> : null}
        </div>
      </div>
    )
  }

  if (collapsed) {
    return (
      <div className={`px-2 ${className}`} title={currentLabel}>
        <button
          type="button"
          onClick={() => departments.length > 1 && setOpen((v) => !v)}
          className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-orange-50 p-2"
          aria-label={`Department: ${currentLabel}`}
        >
          <Building2 className="h-4 w-4 text-orange-600" />
        </button>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        Department
      </p>
      <button
        type="button"
        onClick={() => !loading && departments.length > 0 && setOpen((v) => !v)}
        disabled={loading || departments.length === 0}
        className="flex w-full items-center gap-2 rounded-xl border border-orange-200 bg-orange-50/80 px-3 py-2.5 text-left transition-colors hover:bg-orange-50 disabled:opacity-60"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Building2 className="h-4 w-4 shrink-0 text-orange-600" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{currentLabel}</span>
        {departments.length > 1 ? (
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        ) : null}
      </button>
      {open && departments.length > 1 ? (
        <ul
          className="absolute left-0 right-0 z-40 mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {departments.map((dept) => {
            const active = dept.id === currentId
            return (
              <li key={dept.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => handleSelect(dept.id)}
                  className={`w-full truncate px-3 py-2 text-left text-sm ${
                    active
                      ? 'bg-orange-50 font-medium text-orange-800'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {dept.name}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
