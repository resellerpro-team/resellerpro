import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/reset-password'

    if (code) {
        const supabase = await createClient()

        try {
            // Exchange code for session
            const { error } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
                console.error('Auth callback error:', error.message)
                // Redirect with error parameter
                return NextResponse.redirect(new URL('/reset-password?error=expired', requestUrl.origin))
            }

            // Success - redirect to next page
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                return NextResponse.redirect(`${requestUrl.origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${requestUrl.origin}${next}`)
            }
        } catch (error: any) {
            console.error('Unexpected callback error:', error)
            return NextResponse.redirect(new URL('/reset-password?error=expired', requestUrl.origin))
        }
    }

    // No code present, redirect to login
    return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
