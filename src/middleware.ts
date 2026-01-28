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

  // 🔒 Redirect logged-out users away from dashboard (only if online or no valid session)
  if (!user && !isOffline && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }

  // 🔁 Redirect logged-in users away from login/signup (only if online)
  if (user && !isOffline && (request.nextUrl.pathname === '/signin' || request.nextUrl.pathname === '/signup')) {
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
