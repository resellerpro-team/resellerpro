import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client for middleware context
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // ✋ Allow auth callback to proceed without interference
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return response
  }

  // 🔌 OFFLINE-FIRST: Try to get user from session
  let user = null
  let isOffline = false

  try {
    const { data, error } = await supabase.auth.getUser()

    // Check if error is network-related
    if (error) {
      const isNetworkError =
        error.message?.includes('fetch failed') ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('Network') ||
        error.message?.includes('ENOTFOUND') ||
        error.message?.includes('ERR_INTERNET_DISCONNECTED') ||
        error.message?.includes('ERR_NETWORK_CHANGED') ||
        error.status === 500 ||
        error.status === 0

      if (isNetworkError) {
        isOffline = true
        user = { id: 'offline-user' } as any // Dummy user object
      }
    } else {
      user = data.user
    }
  } catch (error) {
    isOffline = true
    // Allow access when offline - assume user is authenticated from previous session
    user = { id: 'offline-user' } as any
  }

  // 🔐 SESSION ENFORCEMENT: Verify if the session is still active in our database
  // This ensures that "Logout Other Devices" works IMMEDIATELY (Senior Security Standard)
  if (user && !isOffline && !request.nextUrl.pathname.startsWith('/auth') && !request.nextUrl.pathname.startsWith('/api')) {
    try {
      // 🛡️ Proactive Security: Check DB on sensitive dashboard/settings requests to enforce revocation
      const isSensitivePath = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.includes('/settings')

      if (isSensitivePath) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // 🏁 RACE CONDITION PREVENTION (Grace Period)
          // If the session was issued in the last 30 seconds, let it through. 
          // Database replication/indexing might take a moment.
          // Use last_sign_in_at first, but fall back to session age calculation for OTP verification flows
          const lastSignInAt = session.user.last_sign_in_at ? new Date(session.user.last_sign_in_at).getTime() : 0
          // Calculate session creation time from expires_at (sessions typically last 1 hour to 30 days)
          // Defensively assume a short session if expires_at is missing
          const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
          const issuedAtFallback = expiresAt ? (expiresAt - 3600000) : Date.now()
          const issuedAt = lastSignInAt || issuedAtFallback
          const now = Date.now()

          // isBrandNewSession: True if issued in last 45s (including potential clock skew of ±15s)
          const isBrandNewSession = Math.abs(now - issuedAt) < 45000

          if (!isBrandNewSession) {
            // Hash to match DB storage
            const encoder = new TextEncoder()
            const data = encoder.encode(session.access_token)
            const hashBuffer = await crypto.subtle.digest('SHA-256', data)
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            const hashedToken = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

            const { data: dbSession, error: dbError } = await supabase
              .from('user_sessions')
              .select('id')
              .eq('session_token', hashedToken)
              .maybeSingle() // Use maybeSingle to avoid 406/single error if multiple exist (though unlikely due to UNIQUE)

            // If session is missing from DB (revoked), force logout
            if (!dbSession || dbError) {
              if (process.env.NODE_ENV !== 'production') {
                console.warn(`[SECURITY] REJECTED: Revoked session for user ${session.user.id}. Reason: ${dbError ? 'DB Error' : 'No DB record found'}`)
              }
              const url = request.nextUrl.clone()
              url.pathname = '/signin'
              url.searchParams.set('message', 'Security Alert: Your session was terminated from another device.')

              const redirectResponse = NextResponse.redirect(url)

              // 🧹 AGGRESSIVE COOKIE CLEARING
              // Supabase uses multiple cookies (chunking). We must try to clear them all.
              const project = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1].split('.')[0]
              const baseName = `sb-${project}-auth-token`

              // Delete common cookie patterns
              request.cookies.getAll().forEach(cookie => {
                if (cookie.name.includes(baseName)) {
                  redirectResponse.cookies.delete(cookie.name)
                }
              })

              return redirectResponse
            }
          }
        }
      }
    } catch (e) {
      console.warn('Security enforcement fail-open:', e)
    }
  }

  // 🔒 Redirect logged-out users away from dashboard (only if online or no valid session)
  if (!user && !isOffline && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }

  // 🔁 Redirect logged-in users away from login/signup/forgot-password/reset-password (only if online)
  const isAuthPage =
    request.nextUrl.pathname === '/signin' ||
    request.nextUrl.pathname === '/signup' ||
    request.nextUrl.pathname === '/forgot-password' ||
    request.nextUrl.pathname === '/reset-password'

  if (user && !isOffline && isAuthPage) {
    // SPECIAL CASE: Allow /reset-password even if user exists (recovery session)
    if (request.nextUrl.pathname === '/reset-password') {
      return response
    }

    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 🆕 Redirect logged-in users from / → /dashboard
  if (user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

// ✅ Limit middleware to relevant routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
