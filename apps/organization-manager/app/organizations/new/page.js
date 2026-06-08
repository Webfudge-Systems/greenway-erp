'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, User } from 'lucide-react'
import {
  Button,
  Card,
  ELEVATED_SECTION_CARD_CLASS,
  Input,
  SectionCardTitleContent,
} from '@greenways/ui'
import PlatformPageHeader from '../../../components/PlatformPageHeader'
import platformService from '../../../lib/platformService'
import { ORGANIZATION_CREATION_LIMIT } from '../../../lib/site'

export default function NewOrganizationPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerFirstName: '',
    ownerLastName: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const name = form.name.trim()
    const ownerEmail = form.ownerEmail.trim()
    if (!name || !ownerEmail) return

    setSubmitting(true)
    setError('')
    try {
      const org = await platformService.createOrganization({
        name,
        ownerEmail,
        ownerPassword: form.ownerPassword.trim() || undefined,
        ownerFirstName: form.ownerFirstName.trim() || undefined,
        ownerLastName: form.ownerLastName.trim() || undefined,
      })
      router.push(`/organizations/${org.id}`)
    } catch (err) {
      setError(err?.message || 'Failed to create organization')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6">
      <PlatformPageHeader
        title="Create organization"
        subtitle="Provision a tenant workspace and its primary admin user. Each owner account is limited to one organization."
        breadcrumb={[
          { label: 'Organizations', href: '/organizations' },
          { label: 'Create' },
        ]}
      />

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p>{ORGANIZATION_CREATION_LIMIT.message}</p>
        <p className="mt-2">
          Email{' '}
          <a
            href={`mailto:${ORGANIZATION_CREATION_LIMIT.contactEmail}`}
            className="font-medium text-brand-primary hover:underline"
          >
            {ORGANIZATION_CREATION_LIMIT.contactEmail}
          </a>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p>{error}</p>
            {error.includes('Webfudge Systems Team') ? (
              <p className="mt-2">
                Contact{' '}
                <a
                  href={`mailto:${ORGANIZATION_CREATION_LIMIT.contactEmail}`}
                  className="font-medium text-red-900 underline"
                >
                  {ORGANIZATION_CREATION_LIMIT.contactEmail}
                </a>
              </p>
            ) : null}
          </div>
        ) : null}

        <Card
          variant="elevated"
          className={ELEVATED_SECTION_CARD_CLASS}
          title={<SectionCardTitleContent icon={Building2} label="Workspace" />}
          subtitle="Name for this internal organization. A unique slug is generated automatically."
        >
          <Input
            label="Organization name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Acme Operations"
            required
          />
        </Card>

        <Card
          variant="elevated"
          className={ELEVATED_SECTION_CARD_CLASS}
          title={<SectionCardTitleContent icon={User} label="Primary admin" />}
          subtitle="Admin user for this tenant. Each email can only own one organization. A new account is created when the email is not already registered."
        >
          <div className="space-y-4">
            <Input
              label="Owner email"
              type="email"
              value={form.ownerEmail}
              onChange={(e) => setForm((f) => ({ ...f, ownerEmail: e.target.value }))}
              placeholder="admin@company.com"
              required
            />
            <Input
              label="Owner password"
              type="password"
              value={form.ownerPassword}
              onChange={(e) => setForm((f) => ({ ...f, ownerPassword: e.target.value }))}
              placeholder="Required for new accounts (min 8 characters)"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                value={form.ownerFirstName}
                onChange={(e) => setForm((f) => ({ ...f, ownerFirstName: e.target.value }))}
              />
              <Input
                label="Last name"
                value={form.ownerLastName}
                onChange={(e) => setForm((f) => ({ ...f, ownerLastName: e.target.value }))}
              />
            </div>
          </div>
        </Card>

        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Link href="/organizations">
            <Button type="button" variant="secondary" className="w-full sm:w-auto">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting || !form.name.trim() || !form.ownerEmail.trim()}
            className="w-full sm:w-auto"
          >
            {submitting ? 'Creating…' : 'Create organization'}
          </Button>
        </div>
      </form>
    </div>
  )
}
