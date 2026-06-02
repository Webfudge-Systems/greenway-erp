'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@greenways/auth'
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { Button, Input } from '@greenways/ui'
import { ORG_MANAGER_SITE } from '../../lib/site'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')
  const { platformLogin, isAuthenticated, isPlatformAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated && isPlatformAdmin()) {
      router.replace('/organizations')
    }
  }, [isAuthenticated, isPlatformAdmin, loading, router])

  const validate = () => {
    const next = {}
    if (!email) next.email = 'Email is required'
    if (!password) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')
    if (!validate()) return
    setIsSubmitting(true)
    try {
      const result = await platformLogin(email, password)
      if (result?.success) router.replace('/organizations')
      else setLoginError(result?.error || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading && !isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white lg:flex-row">
      <div className="border-b border-orange-100 bg-gradient-to-r from-brand-primary to-orange-600 px-6 py-5 lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold">{ORG_MANAGER_SITE.shortName}</p>
            <p className="text-sm text-white/85">{ORG_MANAGER_SITE.tagline}</p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-primary to-orange-600 flex-col justify-center px-16 py-20">
        <div className="max-w-lg text-white">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-5xl font-bold mb-6">{ORG_MANAGER_SITE.name}</h1>
          <p className="text-xl text-white/90 leading-relaxed">{ORG_MANAGER_SITE.description}</p>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col justify-center p-6 sm:p-8 lg:w-1/2 lg:p-16">
        <div className="mx-auto w-full max-w-md">
          <h2 className="mb-2 text-2xl font-semibold text-brand-dark sm:text-3xl">Super admin sign in</h2>
          <p className="mb-6 text-sm text-gray-600 sm:mb-8 sm:text-base">
            Only seeded platform administrators can access this portal.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {loginError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@greenways.in"
                error={errors.email}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  error={errors.password}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full" variant="primary">
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in to admin portal'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
