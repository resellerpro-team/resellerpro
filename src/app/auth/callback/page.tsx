'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Loader2 } from 'lucide-react'

// Suspense wrapper is needed because this page uses useSearchParams
function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [msg, setMsg] = useState('Verifying login...')

    useEffect(() => {
        const handleCallback = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )

            // 1. Check for Code (PKCE)
            const code = searchParams.get('code')
            const next = searchParams.get('next') || '/dashboard'

            if (code) {
                setMsg('Exchanging code for session...')
                const { error } = await supabase.auth.exchangeCodeForSession(code)
                if (error) {
                    console.error('Exchange Limit Error:', error)
                    setMsg('Login failed. Redirecting...')
                    router.replace('/signin?error=exchange_failed')
                    return
                }
            } else {
                setMsg('Checking session...')
            }

            // 3. Verify Session Exists
            const { data: { session: initialSession }, error } = await supabase.auth.getSession()
            let session = initialSession

            // 3b. Manual Hash Parsing Fallback (Implicit Flow)
            if (!session) {
                const hash = window.location.hash
                if (hash && hash.includes('access_token')) {
                    setMsg('Parsing hash manually...')
                    const params = new URLSearchParams(hash.substring(1)) // remove #
                    const access_token = params.get('access_token')
                    const refresh_token = params.get('refresh_token')

                    if (access_token && refresh_token) {
                        const { data, error: setSessionError } = await supabase.auth.setSession({
                            access_token,
                            refresh_token
                        })
                        if (!setSessionError && data.session) {
                            session = data.session
                        }
                    }
                }
            }

            if (session) {
                setMsg('Login successful! Redirecting...')
                router.refresh() // Refresh to update server components
                router.replace(next)
            } else {
                // Listen for late auth state change
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_IN' && session) {
                        setMsg('Login successful (Async)! Redirecting...')
                        router.refresh()
                        router.replace(next)
                    } else if (event === 'SIGNED_OUT') {
                        setTimeout(async () => {
                            // Double check final time
                            const { data } = await supabase.auth.getSession()
                            if (!data.session) {
                                setMsg('No session found. Redirecting to login...')
                                router.replace('/signin')
                            }
                        }, 3000)
                    }
                })

                return () => {
                    subscription.unsubscribe()
                }
            }
        }

        handleCallback()
    }, [router, searchParams])

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-muted/40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">{msg}</p>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-muted/40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">Loading auth...</p>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    )
}
