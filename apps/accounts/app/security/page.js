'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Lock, Save, Shield } from 'lucide-react'
import { Button, Card, Checkbox, FormSectionCard, Input, LoadingSpinner, Select } from '@greenways/ui'
import AccountsPageHeader from '../../components/AccountsPageHeader'
import { organizationService } from '../../lib/api'

const DEFAULT_FORM = {
  requireMfa: false,
  sessionTimeoutMinutes: 480,
  passwordMinLength: 8,
  allowPasswordLogin: true,
  allowedEmailDomains: '',
}

function StatusBanner({ variant, children }) {
  const styles =
    variant === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-red-200 bg-red-50 text-red-800'
  const Icon = variant === 'success' ? CheckCircle2 : AlertCircle
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${styles}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  )
}

export default function SecurityPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await organizationService.getSecuritySettings()
      const settings = data?.data || data || {}
      setForm({
        requireMfa: !!settings.requireMfa,
        sessionTimeoutMinutes: Number(settings.sessionTimeoutMinutes) || 480,
        passwordMinLength: Number(settings.passwordMinLength) || 8,
        allowPasswordLogin: settings.allowPasswordLogin !== false,
        allowedEmailDomains: Array.isArray(settings.allowedEmailDomains)
          ? settings.allowedEmailDomains.join(', ')
          : '',
      })
    } catch (err) {
      setError(err?.message || 'Failed to load security settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const domains = form.allowedEmailDomains
        .split(',')
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean)
      await organizationService.updateSecuritySettings({
        requireMfa: form.requireMfa,
        sessionTimeoutMinutes: Number(form.sessionTimeoutMinutes) || 480,
        passwordMinLength: Number(form.passwordMinLength) || 8,
        allowPasswordLogin: form.allowPasswordLogin,
        allowedEmailDomains: domains,
      })
      setMessage('Security settings saved successfully.')
      await load()
    } catch (err) {
      setError(err?.message || 'Failed to save security settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-full bg-gray-50">
      <AccountsPageHeader
        title="Security"
        subtitle="Authentication policies, session controls, and access restrictions."
        breadcrumb={[{ label: 'Security', href: '/security' }]}
      />

      <div className="p-6 max-w-3xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {message && <StatusBanner variant="success">{message}</StatusBanner>}
            {error && <StatusBanner variant="error">{error}</StatusBanner>}

            <FormSectionCard title="Authentication" description="Control how users sign in to your organization." icon={Lock}>
              <div className="space-y-4">
                <Checkbox
                  label="Require multi-factor authentication (MFA)"
                  checked={form.requireMfa}
                  onChange={(e) => setForm((f) => ({ ...f, requireMfa: e.target.checked }))}
                />
                <Checkbox
                  label="Allow email/password login"
                  checked={form.allowPasswordLogin}
                  onChange={(e) => setForm((f) => ({ ...f, allowPasswordLogin: e.target.checked }))}
                />
                <Input
                  label="Minimum password length"
                  type="number"
                  min={6}
                  max={128}
                  value={form.passwordMinLength}
                  onChange={(e) => setForm((f) => ({ ...f, passwordMinLength: e.target.value }))}
                />
              </div>
            </FormSectionCard>

            <FormSectionCard title="Sessions" description="Manage session lifetime for workspace apps." icon={Shield}>
              <Select
                label="Session timeout"
                value={String(form.sessionTimeoutMinutes)}
                onChange={(e) => setForm((f) => ({ ...f, sessionTimeoutMinutes: e.target.value }))}
                options={[
                  { value: '60', label: '1 hour' },
                  { value: '240', label: '4 hours' },
                  { value: '480', label: '8 hours' },
                  { value: '1440', label: '24 hours' },
                  { value: '10080', label: '7 days' },
                ]}
              />
            </FormSectionCard>

            <Card className="p-5 space-y-3">
              <h3 className="font-semibold text-gray-900">Email domain restrictions</h3>
              <p className="text-sm text-gray-500">
                Limit invitations to specific email domains (comma-separated). Leave empty to allow any domain.
              </p>
              <Input
                placeholder="example.com, company.org"
                value={form.allowedEmailDomains}
                onChange={(e) => setForm((f) => ({ ...f, allowedEmailDomains: e.target.value }))}
              />
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save security settings'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
