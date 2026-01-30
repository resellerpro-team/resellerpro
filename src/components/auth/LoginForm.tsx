'use client'

import { useFormStatus, useFormState } from 'react-dom'
import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { login, type LoginFormState } from '@/app/(auth)/signin/actions'
import { sendLoginOtp, verifyLoginOtp } from '@/app/(auth)/signin/otp-actions'
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  Shield,
  Zap,
  Check,
  Sparkles,
  TrendingUp,
  Target,
  Rocket
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const isOnline = useOnlineStatus()

  return (
    <Button
      type="submit"
      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
      disabled={isLoading || !isOnline}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Signing in...
        </>
      ) : !isOnline ? (
        'Offline'
      ) : (
        <>
          Sign in
          <ArrowRight className="w-5 h-5 ml-2" />
        </>
      )}
    </Button>
  )
}

// Motivational quotes for resellers
const quotes = [
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "Your most unhappy customers are your greatest source of learning.",
    author: "Bill Gates"
  },
  {
    text: "Every sale has five basic obstacles: no need, no money, no hurry, no desire, no trust.",
    author: "Zig Ziglar"
  }
]

export default function LoginForm() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  // Random quote - set on client side only to avoid hydration mismatch
  const [quote, setQuote] = useState(quotes[0]) // Default to first quote for SSR

  // Set random quote after mount (client-side only)
  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)])
  }, [])

  // Prevent double redirect
  const isRedirecting = useRef(false)

  // OTP State
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpStep, setOtpStep] = useState<'email' | 'verify'>('email')
  const [otpLoading, setOtpLoading] = useState(false)

  // Global Enter key handler
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const isPending = document.querySelector('button[type="submit"]:disabled')
        if (!isPending && !isRedirecting.current) {
          // Find the active form based on login method
          const form = document.querySelector('form')
          if (form) {
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
          }
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [loginMethod, otpStep])

  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined>>({})
  const isOnline = useOnlineStatus()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleBlur = (fieldId: string) => {
    setFocusedField(null)
    setTouchedFields(prev => new Set(prev).add(fieldId))
  }

  // TEACHING NOTE: Login form validation
  // Keep it SIMPLE - just check basic format
  // Don't show specific error messages (security - prevent username enumeration)
  const isFieldValid = (fieldId: string): boolean => {
    if (!touchedFields.has(fieldId)) return true

    switch (fieldId) {
      case 'email':
      case 'otp-email':
        // Same validation as signup for consistency
        const emailToCheck = fieldId === 'email' ? formData.email : otpEmail
        const email = emailToCheck.trim()
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return email.length >= 5 && email.length <= 254 && emailRegex.test(email)

      case 'password':
        // Only check length bounds - format doesn't matter for login
        // The backend will verify the actual password
        return formData.password.length >= 8 && formData.password.length <= 72

      default:
        return true
    }
  }

  // Simple redirect function
  const performRedirect = useCallback((url: string) => {
    if (isRedirecting.current) return
    isRedirecting.current = true

    toast({
      title: "Success",
      description: "Login successful! Redirecting...",
    })

    setTimeout(() => {
      window.location.href = url
    }, 100)
  }, [toast])

  // Check for email verification success
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast({
        title: 'Email verified 🎉',
        description: 'Your account is verified. Please sign in.',
      })
    }
  }, [searchParams, toast])

  // Handle Login Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isOnline) {
      toast({
        title: 'Offline',
        description: 'Please check your internet connection',
        variant: 'destructive',
      })
      return
    }

    if (isRedirecting.current) return

    setIsLoading(true)
    setFormErrors({})

    try {
      const fd = new FormData()
      fd.append('email', formData.email.trim().toLowerCase())
      fd.append('password', formData.password)

      const result = await login({ success: false, message: '' }, fd)

      if (result.success && result.redirectUrl) {
        performRedirect(result.redirectUrl)
      } else {
        setFormErrors(result.errors || {})
        toast({
          title: 'Sign in failed',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast({
        title: 'Sign in failed',
        description: error?.message || 'Unexpected error occurred.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOnline) {
      toast({ title: 'Offline', description: 'Please check your internet connection', variant: 'destructive' })
      return
    }
    if (!otpEmail) {
      toast({ title: 'Error', description: 'Please enter your email', variant: 'destructive' })
      return
    }
    setOtpLoading(true)
    try {
      const res = await sendLoginOtp(otpEmail)
      if (res.success) {
        toast({ title: 'Success', description: res.message })
        setOtpStep('verify')
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOnline) {
      toast({ title: 'Offline', description: 'Please check your internet connection', variant: 'destructive' })
      return
    }
    if (!otpCode || isRedirecting.current) return

    setOtpLoading(true)
    try {
      const res = await verifyLoginOtp(otpEmail, otpCode)
      if (res.success && res.redirectUrl) {
        performRedirect(res.redirectUrl)
      } else {
        toast({ title: 'Error', description: res.message || 'Verification failed', variant: 'destructive' })
        setOtpLoading(false)
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
      setOtpLoading(false)
    }
  }

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-48 left-1/3 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-12">
        <div className="w-full max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Left Side - Minimal Welcome */}
            <div className="hidden lg:flex flex-col justify-center items-center text-center px-4 space-y-8">
              {/* Greeting */}
              <div className="space-y-4">
                <h1 className="text-3xl font-medium text-slate-600">
                  {getGreeting()}!
                </h1>
                <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                  Welcome back
                </h2>
              </div>

              {/* Motivational Quote */}
              <div className="max-w-md space-y-3">
                <blockquote className="text-lg text-slate-600 italic leading-relaxed">
                  "{quote.text}"
                </blockquote>
                <p className="text-sm text-slate-500">
                  — {quote.author}
                </p>
              </div>

              {/* Simple Animation or Icon */}
              <div className="flex items-center gap-4 pt-8">
                <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200/50">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200/50">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200/50">
                  <Rocket className="w-6 h-6 text-indigo-600" />
                </div>
              </div>

              {/* Small footer text */}
              <p className="text-sm text-slate-500">
                Ready to grow your business today?
              </p>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full">
              <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-slate-200/50 shadow-2xl shadow-blue-500/10 p-8 lg:p-10">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {loginMethod === 'password' ? 'Sign in to your account' : 'Sign in with OTP'}
                  </h2>
                  <p className="text-slate-600">
                    {loginMethod === 'password'
                      ? 'Enter your credentials to continue'
                      : "We'll send a verification code to your email"}
                  </p>
                </div>

                {loginMethod === 'password' ? (
                  <div className="space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Email Field */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-blue-600' : 'text-slate-400'
                            }`} />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@email.com"
                            className={`pl-11 h-12 bg-white/50 border-slate-200 transition-all ${focusedField === 'email'
                              ? 'border-blue-600 ring-4 ring-blue-600/10'
                              : 'hover:border-slate-300'
                              } ${formErrors.email ? 'border-rose-300' : ''}`}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => handleBlur('email')}
                            required
                            disabled={isLoading}
                          />
                          {touchedFields.has('email') && isFieldValid('email') && formData.email && (
                            <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                          )}
                        </div>
                        {formErrors.email && (
                          <p className="text-sm text-rose-500 mt-1">
                            {formErrors.email[0]}
                          </p>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                            Password
                          </Label>
                          <Link
                            href="/forgot-password"
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-blue-600' : 'text-slate-400'
                            }`} />
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className={`pl-11 pr-11 h-12 bg-white/50 border-slate-200 transition-all ${focusedField === 'password'
                              ? 'border-blue-600 ring-4 ring-blue-600/10'
                              : 'hover:border-slate-300'
                              } ${formErrors.password ? 'border-rose-300' : ''}`}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => handleBlur('password')}
                            required
                            minLength={8}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {formErrors.password && (
                          <p className="text-sm text-rose-500 mt-1">
                            {formErrors.password[0]}
                          </p>
                        )}
                      </div>

                      <SubmitButton isLoading={isLoading} />
                    </form>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white/80 text-slate-600">Or continue with</span>
                      </div>
                    </div>

                    {/* OTP Option */}
                    <Button
                      variant="outline"
                      className="w-full h-12 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                      onClick={() => setLoginMethod('otp')}
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Sign in with OTP
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {otpStep === 'email' ? (
                      <form onSubmit={handleSendOtp} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="otp-email" className="text-sm font-medium text-slate-700">
                            Email Address
                          </Label>
                          <div className="relative">
                            <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'otp-email' ? 'text-blue-600' : 'text-slate-400'
                              }`} />
                            <Input
                              id="otp-email"
                              type="email"
                              placeholder="you@email.com"
                              className={`pl-11 h-12 bg-white/50 border-slate-200 transition-all ${focusedField === 'otp-email'
                                ? 'border-blue-600 ring-4 ring-blue-600/10'
                                : 'hover:border-slate-300'
                                }`}
                              value={otpEmail}
                              onChange={(e) => setOtpEmail(e.target.value)}
                              onFocus={() => setFocusedField('otp-email')}
                              onBlur={() => handleBlur('otp-email')}
                              required
                              disabled={otpLoading}
                            />
                            {touchedFields.has('otp-email') && isFieldValid('otp-email') && otpEmail && (
                              <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                            )}
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                          disabled={otpLoading || !isOnline}
                        >
                          {otpLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : !isOnline ? (
                            'Offline'
                          ) : (
                            <>
                              Send OTP Code
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                          )}
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-5">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="otp-code" className="text-sm font-medium text-slate-700">
                              Enter OTP Code
                            </Label>
                            <button
                              type="button"
                              onClick={() => setOtpStep('email')}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              Change Email
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'otp-code' ? 'text-blue-600' : 'text-slate-400'
                              }`} />
                            <Input
                              id="otp-code"
                              type="text"
                              placeholder="123456"
                              className={`pl-11 h-12 text-center tracking-widest text-lg font-mono bg-white/50 border-slate-200 transition-all ${focusedField === 'otp-code'
                                ? 'border-blue-600 ring-4 ring-blue-600/10'
                                : 'hover:border-slate-300'
                                }`}
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              onFocus={() => setFocusedField('otp-code')}
                              onBlur={() => handleBlur('otp-code')}
                              required
                              maxLength={6}
                              disabled={otpLoading}
                            />
                          </div>
                          <p className="text-sm text-slate-500">
                            We sent a 6-digit code to <strong className="text-slate-700">{otpEmail}</strong>
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                          disabled={otpLoading || !isOnline}
                        >
                          {otpLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : !isOnline ? (
                            'Offline'
                          ) : (
                            <>
                              Verify & Sign In
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                          )}
                        </Button>
                      </form>
                    )}

                    <Button
                      variant="ghost"
                      className="w-full h-12 hover:bg-slate-50"
                      onClick={() => {
                        setLoginMethod('password')
                        setOtpStep('email')
                        setOtpEmail('')
                        setOtpCode('')
                      }}
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back to password login
                    </Button>
                  </div>
                )}

                {/* Sign Up Link */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <p className="text-center text-sm text-slate-600">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                      Sign up for free
                    </Link>
                  </p>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure login</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Quick access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}