'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@greenways/auth'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import {
  Button,
  Input,
  LoginBrandingPanel,
  LoginBrandingMobile,
  LoginMobileBrandHeader,
} from '@greenways/ui'
import { ORG_MANAGER_SITE } from '../../lib/site'

const LOGIN_BRANDING = {
  productName: ORG_MANAGER_SITE.productName,
  brandName: ORG_MANAGER_SITE.brandName,
  brandIconPath: ORG_MANAGER_SITE.loginLogoPath,
  creatorLine: 'by Webfudge Systems',
  headline: 'Welcome back',
  summary:
    'Your central hub to manage all your organizations — teams, access, and apps in one place.',
  description:
    'Switch between organizations, invite your team, and open Fudge ERP and Fudge Base for each company.',
  usageCards: [
    { label: 'Organizations', value: 'Manage' },
    { label: 'Teams', value: 'Invite' },
    { label: 'Apps', value: 'Open' },
  ],
}

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
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-lg border border-gray-100">
          <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
          <span className="font-medium text-brand-dark">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LoginBrandingMobile
        productName={LOGIN_BRANDING.productName}
        brandName={LOGIN_BRANDING.brandName}
        brandIconPath={LOGIN_BRANDING.brandIconPath}
        summary={LOGIN_BRANDING.summary}
      />
      <LoginBrandingPanel {...LOGIN_BRANDING} />

      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16">
        <div className="w-full max-w-md mx-auto">
          <LoginMobileBrandHeader
            brandIconPath={LOGIN_BRANDING.brandIconPath}
            brandName={LOGIN_BRANDING.brandName}
            productName={LOGIN_BRANDING.productName}
            creatorLine={LOGIN_BRANDING.creatorLine}
          />
          <h2 className="text-3xl font-semibold text-brand-dark mb-2">Super admin sign in</h2>
          <p className="text-gray-600 mb-8">
            Sign in to {ORG_MANAGER_SITE.productName}. Only seeded platform administrators can access this portal.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {loginError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Login failed</p>
                  <p className="text-sm text-red-700 mt-1">{loginError}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-1.5">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@greenways.in"
                error={errors.email}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-dark mb-1.5">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  error={errors.password}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark"
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
