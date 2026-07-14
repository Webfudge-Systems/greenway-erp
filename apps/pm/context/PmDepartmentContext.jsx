'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@greenways/auth'

const PmDepartmentContext = createContext({
  departmentId: null,
  revision: 0,
  switchDepartment: () => false,
})

/**
 * Active PM workspace department — changing it bumps `revision` so pages refetch/remount.
 */
export function PmDepartmentProvider({ children }) {
  const router = useRouter()
  const [departmentId, setDepartmentId] = useState(null)
  const [revision, setRevision] = useState(0)

  const bump = useCallback(
    (nextId) => {
      setDepartmentId(nextId ?? authService.getCurrentDepartmentId())
      setRevision((r) => r + 1)
      router.refresh()
    },
    [router]
  )

  const switchDepartment = useCallback(
    (id) => {
      if (!authService.setCurrentDepartment(id)) return false
      // Notify listeners (sidebar options, etc.). Provider listener bumps revision.
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('gw:department-changed'))
      } else {
        bump(id)
      }
      return true
    },
    [bump]
  )

  useEffect(() => {
    setDepartmentId(authService.getCurrentDepartmentId())
  }, [])

  useEffect(() => {
    const onExternal = () => {
      setDepartmentId(authService.getCurrentDepartmentId())
      setRevision((r) => r + 1)
      router.refresh()
    }
    window.addEventListener('gw:department-changed', onExternal)
    window.addEventListener('gw:org-changed', onExternal)
    return () => {
      window.removeEventListener('gw:department-changed', onExternal)
      window.removeEventListener('gw:org-changed', onExternal)
    }
  }, [router])

  return (
    <PmDepartmentContext.Provider value={{ departmentId, revision, switchDepartment, bump }}>
      {children}
    </PmDepartmentContext.Provider>
  )
}

export function usePmDepartment() {
  return useContext(PmDepartmentContext)
}

/** Use in useEffect dependency arrays to refetch when department changes. */
export function usePmDepartmentRevision() {
  return useContext(PmDepartmentContext).revision
}
