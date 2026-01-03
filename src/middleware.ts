import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  console.log('User:', user?.email)
console.log('Pathname:', pathname)


  // =====================================================
  // 1️⃣  EXCLUDE STATIC & PUBLIC ROUTES
  // =====================================================
  const publicRoutes = ['/', '/login', '/signup', '/admin/login']
  const isPublic = publicRoutes.includes(pathname)

  // =====================================================
  // 2️⃣  ADMIN ROUTE PROTECTION
  // =====================================================
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Redirect non-admins to dashboard
      if (!profile || profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // =====================================================
  // 3️⃣  USER DASHBOARD PROTECTION
  // =====================================================
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/usage')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // If admin tries to access normal user area
    if (profile?.role === 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // =====================================================
  // 4️⃣  REDIRECT AFTER LOGIN
  // =====================================================
  if (user && ['/login', '/signup', '/admin/login'].includes(pathname)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    if (profile?.role === 'admin') {
      url.pathname = '/admin/dashboard'
    } else {
      url.pathname = '/dashboard'
    }
    return NextResponse.redirect(url)
  }

  // =====================================================
  // 5️⃣  REDIRECT ROOT BASED ON USER ROLE
  // =====================================================
  if (user && pathname === '/') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname =
      profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

// =====================================================
// ✅ MIDDLEWARE CONFIG
// =====================================================
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
