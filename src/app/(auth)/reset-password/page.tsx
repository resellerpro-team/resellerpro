'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Check for recovery session in URL hash
  useEffect(() => {
    const checkRecoverySession = async () => {
      const supabase = createClient()

      // First check URL hash for access_token (this is how Supabase sends it)
      const hashFragment = window.location.hash
      const hashParams = new URLSearchParams(hashFragment.substring(1))
      const type = hashParams.get('type')

      if (type === 'recovery') {
        // Recovery link detected - session should be automatically set
        // Wait a moment for Supabase to process it
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Now verify we have a valid session
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        setVerificationError(
          'No password reset session found. Please click the reset link from your email again. IMPORTANT: The link must open in the SAME browser where you are viewing this message.'
        )
        setIsVerifying(false)
        return
      }

      // Valid session exists
      setIsVerifying(false)
    }

    checkRecoverySession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setFormError("Passwords don't match.")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        console.error('Password update error:', error)

        if (error.message.includes('session')) {
          setFormError('Session expired. Please click the reset link from your email again.')
        } else {
          setFormError(error.message || 'Failed to update password. Please try again.')
        }
        setIsSubmitting(false)
        return
      }

      setSuccess(true)

      // 🧹 Explicitly sign out to destroy the recovery session
      // This prevents the middleware from auto-redirecting to /dashboard
      await supabase.auth.signOut()

      setTimeout(() => {
        router.push('/signin?message=Password updated successfully!')
      }, 2000)

    } catch (error: any) {
      console.error('Unexpected error:', error)
      setFormError('An unexpected error occurred. Please try again later.')
      setIsSubmitting(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Verifying password reset session...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (verificationError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Session Required</CardTitle>
            <CardDescription>
              Password reset link must be opened in this browser
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Reset Session</AlertTitle>
              <AlertDescription>{verificationError}</AlertDescription>
            </Alert>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important Instructions</AlertTitle>
              <AlertDescription className="space-y-2 text-sm">
                <p>Password reset uses browser session storage. Follow these steps:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Make sure you're in the <strong>same browser</strong> where you requested the password reset</li>
                  <li>Click the reset link directly from your email</li>
                  <li>Don't copy/paste the link to a different browser</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button
                onClick={() => router.push('/forgot-password')}
                className="w-full"
              >
                Request New Reset Link
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below. It must be at least 6 characters long.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Password updated successfully! Redirecting to sign in...
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}