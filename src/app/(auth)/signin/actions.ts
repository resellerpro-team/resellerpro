'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

// TEACHING NOTE: Login validation is different from signup validation
// Why? SECURITY - we don't want to reveal which field is wrong
// - Never tell the user "email doesn't exist" or "wrong password"
// - This prevents "username enumeration" attacks where hackers probe which emails have accounts
// - Always return generic "Invalid credentials" error

const LoginSchema = z.object({
  // EMAIL VALIDATION
  // Same rules as signup for consistency, but GENERIC error messages
  // Note: We use "Invalid credentials" for all email errors (don't reveal it's the email)
  email: z.string()
    .trim()
    .toLowerCase()
    .min(5, 'Invalid credentials.') // Generic error - don't reveal it's too short
    .max(254, 'Invalid credentials.') // Generic error - don't reveal it's too long
    .email({ message: 'Invalid credentials.' }), // Generic error - don't reveal format is wrong

  // PASSWORD VALIDATION
  // Only validate LENGTH bounds, not format/complexity
  // Why? We're just checking if the password could possibly be valid
  // The actual password check happens via Supabase auth (bcrypt comparison)
  password: z.string()
    .min(8, 'Invalid credentials.') // Generic error
    .max(72, 'Invalid credentials.'), // Generic error - bcrypt limit
})

export type LoginFormState = {
  success: boolean
  message: string
  errors?: Record<string, string[] | undefined>
  redirectUrl?: string
}

export async function login(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {

  try {
    const supabase = await createClient()

    // ----------------------------------------------
    // 1️⃣ GET IP ADDRESS
    // ----------------------------------------------
    const hdr = await headers()
    const ip =
      hdr.get('x-forwarded-for')?.split(',')[0] ||
      hdr.get('x-real-ip') ||
      'unknown'

    // ----------------------------------------------
    // 2️⃣ VALIDATE INPUT
    // ----------------------------------------------
    const validatedFields = LoginSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        message: 'Invalid form data.',
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { email, password } = validatedFields.data

    // ----------------------------------------------
    // 3️⃣ CHECK RATE LIMIT (5 attempts / 10 minutes)
    // ----------------------------------------------
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

    const { count: recentAttempts } = await supabase
      .from('login_attempts')
      .select('id', { count: 'exact' })
      .eq('email', email)
      .eq('ip_address', ip)
      .gte('created_at', tenMinutesAgo)

    if ((recentAttempts ?? 0) >= 5) {
      return {
        success: false,
        message: 'Too many failed attempts. Please wait 10 minutes and try again.',
      }
    }

    // ----------------------------------------------
    // 4️⃣ LOG THIS ATTEMPT (before checking password)
    // ----------------------------------------------
    await supabase.from('login_attempts').insert({
      email,
      ip_address: ip,
    })

    // ----------------------------------------------
    // 5️⃣ TRY LOGIN
    // ----------------------------------------------
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // SECURITY: Always return the same generic error message
      // Don't reveal whether the email exists or if the password is wrong
      // This prevents username enumeration attacks
      return {
        success: false,
        message: 'Invalid credentials.',
      }
    }

    // ----------------------------------------------
    // 6️⃣ SUCCESS — CHECK IF FIRST LOGIN
    // ----------------------------------------------
    const { data: { user } } = await supabase.auth.getUser()

    let redirectUrl = '/dashboard'

    if (user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('welcome_shown, referral_bonus_amount')
        .eq('id', user.id)
        .single()

      if (profile && profile.welcome_shown === false) {
        redirectUrl = `/dashboard?welcome=true&bonus=${profile.referral_bonus_amount || 0}`
      }
    }

    revalidatePath('/')
    return {
      success: true,
      message: 'Login successful',
      redirectUrl
    }
  } catch (error: any) {
    console.error('Unexpected login error:', error)
    return {
      success: false,
      message: error.message?.includes('fetch')
        ? 'Network error. Please check your internet connection.'
        : 'An unexpected error occurred. Please try again.',
    }
  }
}
