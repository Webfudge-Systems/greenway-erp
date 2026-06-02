'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  Button,
  EmptyState,
  Input,
  LoadingSpinner,
  Modal,
  Select,
  Table,
  TableCellText,
  TableEmptyBelow,
  Textarea,
} from '@greenways/ui'
import AccountsPageHeader from '../../components/AccountsPageHeader'
import { departmentsService, usersService } from '../../lib/api'

function userLabel(user) {
  if (!user) return '—'
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return name || user.email || user.username || `User ${user.id}`
}

function normalizeRow(row) {
  const lead = row.lead && typeof row.lead === 'object' ? row.lead : null
  const parent = row.parent && typeof row.parent === 'object' ? row.parent : null
  return {
    id: row.id,
    name: row.name || '',
    description: row.description || '',
    isActive: row.isActive !== false,
    leadId: lead?.id ?? '',
    leadLabel: userLabel(lead),
    parentId: parent?.id ?? '',
    parentName: parent?.name || '',
  }
}

export default function DepartmentsPage() {
  const [rows, setRows] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', leadId: '', parentId: '', isActive: true })
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [deptData, userResponse] = await Promise.all([departmentsService.list(), usersService.list()])
      setRows((deptData || []).map(normalizeRow))
      const userList = Array.isArray(userResponse) ? userResponse : Array.isArray(userResponse?.data) ? userResponse.data : []
      setUsers(userList.map((m) => m.user || m))
    } catch (err) {
      setError(err?.message || 'Failed to load departments')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
  }, [rows, searchQuery])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', leadId: '', parentId: '', isActive: true })
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      name: row.name,
      description: row.description,
      leadId: row.leadId ? String(row.leadId) : '',
      parentId: row.parentId ? String(row.parentId) : '',
      isActive: row.isActive,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        isActive: form.isActive,
        lead: form.leadId ? Number(form.leadId) : null,
        parent: form.parentId ? Number(form.parentId) : null,
      }
      if (editing) {
        await departmentsService.update(editing.id, payload)
      } else {
        await departmentsService.create(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(err?.message || 'Failed to save department')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete department "${row.name}"?`)) return
    try {
      await departmentsService.delete(row.id)
      await load()
    } catch (err) {
      setError(err?.message || 'Failed to delete department')
    }
  }

  const columns = [
    { key: 'name', label: 'Department', sortable: true },
    { key: 'leadLabel', label: 'Lead', sortable: true },
    { key: 'parentName', label: 'Parent', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
    { key: 'actions', label: '', sortable: false },
  ]

  return (
    <div className="min-h-full bg-gray-50">
      <AccountsPageHeader
        title="Departments"
        subtitle="Manage department hierarchy, leads, and user mapping."
        breadcrumb={[{ label: 'Departments', href: '/departments' }]}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search departments..."
        actions={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Add department
          </Button>
        }
      />

      <div className="p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No departments yet"
            description="Create departments to organize users and teams across your organization."
            action={<Button onClick={openCreate}>Add department</Button>}
          />
        ) : (
          <Table
            columns={columns}
            data={filtered}
            renderCell={(row, column) => {
              if (column.key === 'name') return <TableCellText primary={row.name} secondary={row.description} />
              if (column.key === 'leadLabel') return <TableCellText primary={row.leadLabel} />
              if (column.key === 'parentName') return <TableCellText primary={row.parentName || '—'} />
              if (column.key === 'status') {
                return (
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      row.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {row.isActive ? 'Active' : 'Inactive'}
                  </span>
                )
              }
              if (column.key === 'actions') {
                return (
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => openEdit(row)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => handleDelete(row)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" aria-label="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              }
              return null
            }}
          />
        )}
        {!loading && filtered.length > 0 && <TableEmptyBelow count={filtered.length} noun="department" />}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit department' : 'Add department'} maxWidth="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
          <Select
            label="Department lead"
            value={form.leadId}
            onChange={(e) => setForm((f) => ({ ...f, leadId: e.target.value }))}
            options={[
              { value: '', label: 'No lead assigned' },
              ...users.map((u) => ({
                value: String(u.id),
                label: userLabel(u),
              })),
            ]}
          />
          <Select
            label="Parent department"
            value={form.parentId}
            onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
            options={[
              { value: '', label: 'None (top level)' },
              ...rows
                .filter((r) => !editing || r.id !== editing.id)
                .map((r) => ({ value: String(r.id), label: r.name })),
            ]}
          />
          <Select
            label="Status"
            value={form.isActive ? 'active' : 'inactive'}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === 'active' }))}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Save changes' : 'Create department'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
