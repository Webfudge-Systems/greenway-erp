'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@greenways/auth'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import {
  Button,
  Input,
  LoginBrandingPanel,
  LoginBrandingMobile,
  LoginMobileBrandHeader,
} from '@greenways/ui'
import { ACCOUNTS_SITE } from '../../lib/site'

const LOGIN_BRANDING = {
  productName: ACCOUNTS_SITE.productName,
  brandName: ACCOUNTS_SITE.brandName,
  brandIconPath: ACCOUNTS_SITE.loginLogoPath,
  creatorLine: 'by Webfudge Systems',
  headline: 'Welcome back',
  summary: 'Account management — users, roles, security, and access in one workspace.',
  description:
    'Sign in to manage your organization, control access, and keep your team secure.',
  usageCards: [
    { label: 'Users', value: 'Manage' },
    { label: 'Roles', value: 'Control' },
    { label: 'Security', value: 'Protect' },
  ],
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')
  const { login, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) router.push('/')
  }, [isAuthenticated, loading, router])

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
      const result = await login(email, password)
      if (result?.success) router.replace('/')
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
          <h2 className="text-3xl font-semibold text-brand-dark mb-2">Sign in</h2>
          <p className="text-gray-600 mb-8">
            Enter your credentials to access {ACCOUNTS_SITE.productName}.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {loginError && <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"><AlertCircle className="w-4 h-4 mt-0.5" />{loginError}</div>}
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" error={errors.email} />
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" error={errors.password} className="pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full" variant="primary">
              {isSubmitting ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Signing in...</span> : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
