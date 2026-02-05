'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { headers } from 'next/headers'
import { createNotification } from '@/lib/services/notificationService'
import { OtpService } from '@/lib/auth/otp'

// -------------------------------
// Validation schema
// -------------------------------
// TEACHING NOTE: Why validate on the backend even if frontend validates?
// - Frontend can be bypassed (browser dev tools, direct API calls)
// - Backend is the security boundary - NEVER trust client input
// - This is "defense in depth" - multiple layers of security

const SignupSchema = z.object({
  // EMAIL VALIDATION
  // Why these rules?
  // - min 5: Shortest valid email is "a@b.c" (5 characters)
  // - max 254: RFC 5321 standard for email length
  // - trim(): Remove accidental whitespace from copy-paste
  // - toLowerCase(): Emails are case-insensitive, prevents duplicate accounts (User@example.com vs user@example.com)
  email: z.string()
    .trim()
    .toLowerCase()
    .min(5, 'Email must be at least 5 characters.')
    .max(254, 'Email must not exceed 254 characters.')
    .email('Invalid email address.'),

  // PASSWORD VALIDATION
  // Why these rules?
  // - min 8: NIST SP 800-63B and OWASP recommend minimum 8 characters
  // - max 72: bcrypt (our password hashing algorithm) truncates passwords beyond 72 bytes
  // - NO complexity rules: Research shows passphrases are stronger than complex passwords
  //   Example: "correct horse battery staple" > "P@ssw0rd1"
  password: z.string()
    .min(8, 'Password must be at least 8 characters.')
    .max(72, 'Password must not exceed 72 characters.'),

  // FULL NAME VALIDATION
  // Why these rules?
  // - min 2: Allow short names like "Li", "Xi", "Ed"
  // - max 50: Reasonable UI/database constraint
  // - trim(): Clean up whitespace
  fullName: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name must not exceed 50 characters.'),

  // BUSINESS NAME VALIDATION
  // Made mandatory as per requirements
  businessName: z.string()
    .trim()
    .min(2, 'Business name must be at least 2 characters.')
    .max(50, 'Business name must not exceed 50 characters.'),

  // PHONE VALIDATION
  // Made optional as per requirements
  // If you need phone validation, add .regex() or custom validation
  phone: z.string().optional().or(z.literal('')),

  // REFERRAL CODE
  // Optional field, no specific validation needed
  referralCode: z.string().optional().or(z.literal('')),
})

export type SignupFormState = {
  success: boolean
  message: string
  referralCredited?: boolean
  referralAmount?: number
  redirectUrl?: string
  errors?: Record<string, string[]>
}

export async function signup(
  prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {

  const supabase = await createClient()

  /* -------------------------------
     1️⃣ Get client IP
  -------------------------------- */
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0] ||
    headersList.get('x-real-ip') ||
    'unknown'

  /* -------------------------------
     2️⃣ IP signup limit
  -------------------------------- */
  const { count: ipCount, error: ipCountError } = await supabase
    .from('signup_ip_log')
    .select('id', { count: 'exact' })
    .eq('ip_address', ip)

  if (ipCountError) {
    console.error('❌ IP COUNT ERROR:', ipCountError)
  }

  if ((ipCount ?? 0) >= 2) {
    console.warn('🚫 IP LIMIT REACHED')
    return {
      success: false,
      message: 'You already have an account on ResellerPro. Please login.',
    }
  }

  /* -------------------------------
     3️⃣ Validate input
  -------------------------------- */
  const validatedFields = SignupSchema.safeParse({
    fullName: formData.get('fullName'),
    businessName: formData.get('businessName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
    referralCode: formData.get('referralCode'),
  })

  if (!validatedFields.success) {
    console.error('❌ VALIDATION FAILED', validatedFields.error.flatten())
    return {
      success: false,
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const {
    email,
    password,
    fullName,
    businessName,
    phone,
    referralCode,
  } = validatedFields.data

  /* -------------------------------
     4️⃣ Create Auth user (Admin API)
  -------------------------------- */
  // We use the Admin API to create the user with `email_confirm: true`
  // so they can login immediately without clicking a link.
  // We will enforce "business verification" via the `profiles.email_verified` column.

  const adminSupabase = await createAdminClient()

  const { data: adminUser, error: adminError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email at Auth level
    user_metadata: {
      full_name: fullName,
      business_name: businessName ?? '',
      phone,
      referral_code: referralCode ? referralCode.trim().toUpperCase() : null,
    }
  })

  if (adminError) {
    console.error('❌ ADMIN CREATE USER ERROR:', adminError.message)
    return {
      success: false,
      message: adminError.message,
    }
  }

  if (!adminUser.user) {
    return {
      success: false,
      message: 'Signup failed: User could not be created.',
    }
  }

  // ---------------------------------------------------------
  // 5️⃣ Sign In Immediately (Create Session)
  // ---------------------------------------------------------
  // Now that the user exists and is confirmed, we can sign them in.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    console.error('❌ AUTO-LOGIN ERROR:', signInError.message)
    // We don't fail the whole request, but we can't redirect to dashboard logged in.
    // However, for UX, we should probably return specific message.
    return {
      success: true, // Account created successfully
      message: 'Account created. Please sign in.',
    }
  }

  /* -------------------------------
     6️⃣ Log IP usage
  -------------------------------- */
  const { error: ipInsertError } = await supabase
    .from('signup_ip_log')
    .insert({
      ip_address: ip,
    })

  if (ipInsertError) {
    console.error('❌ IP LOG INSERT ERROR:', ipInsertError)
  }



  /* -------------------------------
     8️⃣ PROCESS REFERRAL
  -------------------------------- */
  let referralResult: any = null

  if (referralCode && referralCode.trim()) {
    // Wait briefly for triggers to run (profiles creation etc)
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      const { data: referralData, error: referralError } = await adminSupabase
        .rpc('process_signup_referral', {
          p_user_id: adminUser.user.id
        })

      if (!referralError) {
        referralResult = referralData
      } else {
        console.warn('Referral processing error:', referralError)
      }

    } catch (error: any) {
      console.error('⚠️ REFERRAL ERROR (non-critical):', error.message)
    }

    // Create Notification
    if (referralResult?.credited && referralResult?.amount > 0) {
      await createNotification({
        userId: adminUser.user.id,
        type: 'wallet_credited',
        title: 'Wallet credited',
        message: `₹${referralResult.amount} added to your wallet`,
        entityType: 'wallet',
        priority: 'low',
      })
    }
  }

  revalidatePath('/')

  // Get user profile to check if first login
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

  return {
    success: true,
    message: 'Signup successful!',
    referralCredited: referralResult?.credited || false,
    referralAmount: referralResult?.amount || 0,
    redirectUrl
  }
}
