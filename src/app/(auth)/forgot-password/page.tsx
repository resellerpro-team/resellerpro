'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sendResetEmail } from './actions'
import { Loader2, Mail, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetEmail = email.trim()
    if (!targetEmail) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      console.log('[FORGOT-PASSWORD] Sending reset instructions to:', targetEmail)
      const result = await sendResetEmail(targetEmail)
      console.log('[FORGOT-PASSWORD] Result:', result)

      if (result.success) {
        
        // Show immediate success toast
        toast({
          title: "Success! 📧",
          description: "Check your email for the reset link.",
        })

        // Give the user a moment to see the success state, then redirect
        setTimeout(() => {
          router.push(`/signin?message=Success! Check your email (${targetEmail}) for the reset link.`)
        }, 3000)
      } else {
        setErrorMessage(result.message)
        toast({
          title: "Request failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('[FORGOT-PASSWORD] unexpected error:', error)
      const msg = 'An unexpected error occurred. Please try again.'
      setErrorMessage(msg)
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-blue-500/5 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isSuccess ? 'Check your email' : 'Forgot Password'}
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            {isSuccess
              ? `Verification link sent to ${email}`
              : "Enter your email to receive reset instructions."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6" key={isSuccess ? 'success-view' : 'input-view'}>
          {isSuccess ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex flex-col items-center justify-center py-4 space-y-4 text-center">
                <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center pulse-animation">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Email Request Successful
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 px-2">
                    A recovery link has been sent. Check your inbox and spam folder. The link is valid for 1 hour.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-11 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => setIsSuccess(false)}
                >
                  Entered wrong email? Try again
                </Button>
                <div className="text-center">
                  <Link
                    href="/signin"
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                  >
                    Back to login
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive" className="bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50">
                  <AlertDescription className="text-rose-800 dark:text-rose-200">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-11 h-12 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 transition-all"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending Instructions...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
              <div className="text-center pt-2">
                <Link
                  href="/signin"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                >
                  Suddenly remembered? <span className="font-medium">Back to login</span>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}