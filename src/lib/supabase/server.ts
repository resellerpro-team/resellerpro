import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  // This is the official, recommended pattern from Supabase.
  // The try/catch blocks are essential for Server Actions.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.error('Failed to set cookie:', name, error)
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing the session.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            console.error('Failed to remove cookie:', name, error)
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing the session.
          }
        },
      },
    }
  )
}