'use client'

import { useFormStatus, useFormState } from 'react-dom'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import NextImage from 'next/image'
import { useSearchParams } from 'next/navigation'
import { login, type LoginFormState } from '@/app/(auth)/signin/actions'
import { sendLoginOtp, verifyLoginOtp } from '@/app/(auth)/signin/otp-actions'
import { Eye, EyeOff, Loader2, Mail, Lock, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'

function SubmitButton() {
  const { pending } = useFormStatus()
  const isOnline = useOnlineStatus()

  return (
    <Button
      type="submit"
      className="w-full"
      size="lg"
      disabled={pending || !isOnline}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : !isOnline ? (
        'Offline'
      ) : (
        'Sign in'
      )}
    </Button>
  )
}

export default function LoginForm() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password')

  // OTP State
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpStep, setOtpStep] = useState<'email' | 'verify'>('email')
  const [otpLoading, setOtpLoading] = useState(false)

  // Password Login State
  const initialState: LoginFormState = {
    success: false,
    message: '',
    errors: {},
  }

  const [formState, formAction] = useFormState(login, initialState)
  const state = formState || initialState

  // Check for email verification success
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast({
        title: 'Email verified 🎉',
        description: 'Your account is verified. Please sign in.',
      })
    }
  }, [searchParams, toast])

  useEffect(() => {
    if (!state.success && state.message) {
      const isNetwork = state.message.includes('Network') || state.message.includes('fetch')

      toast({
        title: 'Sign in failed',
        description: state.message,
        variant: 'destructive',
        action: isNetwork ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="border-white text-white hover:bg-white/20"
          >
            Check Connection
          </Button>
        ) : undefined
      })
    }
  }, [state, toast])

  const isOnline = useOnlineStatus()

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
    } catch (err) {
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
    if (!otpCode) return
    setOtpLoading(true)
    try {
      const res = await verifyLoginOtp(otpEmail, otpCode)
      if (res.success && res.redirectUrl) {
        toast({ title: 'Success', description: 'Login successful! Redirecting...' })
        window.location.href = res.redirectUrl
      } else {
        toast({ title: 'Error', description: res.message || 'Verification failed', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md relative z-10 border-2">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl border border-gray-100 p-2 overflow-hidden">
            <NextImage
              src="/logo.png"
              alt="ResellerPro Logo"
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
            />
          </div>

          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold">
              {loginMethod === 'password' ? 'Welcome back' : 'Sign in with OTP'}
            </CardTitle>
            <CardDescription className="text-base">
              {loginMethod === 'password'
                ? 'Sign in to continue to your dashboard'
                : 'We\'ll send a code to your email to sign you in'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {loginMethod === 'password' ? (
            <div className="space-y-4">
              <form action={formAction} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      required
                    />
                    {state.errors?.email && (
                      <p className="text-sm text-destructive mt-1">
                        {state.errors.email[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>

                    {state.errors?.password && (
                      <p className="text-sm text-destructive mt-1">
                        {state.errors.password[0]}
                      </p>
                    )}
                  </div>
                </div>

                <SubmitButton />
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLoginMethod('otp')}
              >
                Sign in with OTP
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {otpStep === 'email' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="otp-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        required
                        disabled={otpLoading}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={otpLoading || !isOnline}>
                    {otpLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : !isOnline ? 'Offline' : 'Send OTP Code'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="otp-code">Enter OTP</Label>
                      <button type="button" onClick={() => setOtpStep('email')} className="text-xs text-primary hover:underline">Change Email</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="otp-code"
                        type="text"
                        placeholder="123456"
                        className="pl-10 text-center tracking-widest text-lg font-mono"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        required
                        maxLength={6}
                        disabled={otpLoading}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Check your email for the code to sign in.</p>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={otpLoading || !isOnline}>
                    {otpLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : !isOnline ? 'Offline' : 'Verify & Sign In'}
                  </Button>
                </form>
              )}

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setLoginMethod('password')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Password Login
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
