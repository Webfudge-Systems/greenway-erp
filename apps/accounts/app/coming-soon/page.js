'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Clock } from 'lucide-react'

function ComingSoonContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const feature = searchParams.get('feature') || 'This feature'
  const featureName = feature.charAt(0).toUpperCase() + feature.slice(1).replace(/-/g, ' ')

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="mx-auto max-w-md px-6 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
          <Clock className="h-10 w-10 text-orange-600" />
        </div>
        <h1 className="mb-3 text-3xl font-bold text-gray-900">Coming Soon</h1>
        <p className="mb-2 text-gray-600">
          <span className="font-semibold text-gray-900">{featureName}</span> is currently under development.
        </p>
        <p className="mb-8 text-gray-500">We&apos;re working on this feature. Check back soon.</p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-3 font-medium text-white transition-colors hover:bg-brand-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export default function ComingSoonPage() {
  return (
    <Suspense>
      <ComingSoonContent />
    </Suspense>
  )
}
