'use client'

import { useFormStatus, useFormState } from 'react-dom'
import { useEffect } from 'react'
import Link from 'next/link'
import { sendResetEmail, type ForgotPasswordFormState } from './actions'
import { Loader2, Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        'Send Reset Link'
      )}
    </Button>
  )
}

export default function ForgotPasswordPage() {
  const initialState: ForgotPasswordFormState = { success: false, message: '', errors: {} }
  const [state, formAction] = useFormState(sendResetEmail, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.success ? (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {state.message}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {state.message && !state.success && (
                <Alert variant="destructive">
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}
              <form action={formAction} className="space-y-4">
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
                  </div>
                  {state.errors?.email && (
                    <p className="text-sm text-destructive">{state.errors.email[0]}</p>
                  )}
                </div>
                <SubmitButton />
              </form>
            </>
          )}
          <div className="text-center">
            <Link
              href="/signin"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Back to Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}