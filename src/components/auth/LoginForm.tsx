'use client'

import { useFormStatus, useFormState } from 'react-dom'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { login, type LoginFormState } from '@/app/(auth)/login/actions'
import { Eye, EyeOff, Loader2, Mail, Lock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from "@/hooks/use-toast"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : 'Login'}
    </Button>
  )
}

export default function LoginForm() {
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const initialState: LoginFormState = { success: false, message: '', errors: {} }
  const [state, formAction] = useFormState(login, initialState)

  useEffect(() => {
    if (!state.success && state.message) {
      toast({
        title: 'Login Failed',
        description: state.message,
        variant: 'destructive',
      })
    }
  }, [state, toast])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md relative z-10 border-2">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base">Enter your credentials to access your account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" name="email" type="email" placeholder="you@example.com" className="pl-10" required />
                {state.errors?.email && <p className="text-sm text-destructive mt-1">{state.errors.email[0]}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-10 pr-10" required minLength={6} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {state.errors?.password && <p className="text-sm text-destructive mt-1">{state.errors.password[0]}</p>}
              </div>
            </div>
            <SubmitButton />
          </form>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary font-medium hover:underline">Sign up for free</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
