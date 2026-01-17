'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Server Action to handle user logout.
 */
export async function logout() {
  const supabase = await createClient();

  // Sign out the user from Supabase Auth
  await supabase.auth.signOut();

  // Redirect the user to the login page after signing out
  // The middleware will also ensure they can't access dashboard pages
  return redirect('/signin')
}