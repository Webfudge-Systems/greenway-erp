'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@greenways/auth'
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react'
import { Button, Input } from '@greenways/ui'
import { ACCOUNTS_SITE } from '../../lib/site'

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
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-primary" /></div>
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-primary to-orange-600 flex-col justify-center px-16 py-20">
        <div className="max-w-lg text-white">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6"><ShieldCheck className="w-6 h-6" /></div>
          <h1 className="text-5xl font-bold mb-6">{ACCOUNTS_SITE.brandName}</h1>
          <p className="text-xl text-white/90">Identity, access, and organization administration in one workspace.</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16">
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-3xl font-semibold text-brand-dark mb-2">Sign in</h2>
          <p className="text-gray-600 mb-8">Enter your credentials to access Accounts.</p>
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
