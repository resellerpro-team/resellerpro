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
const SignupSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  businessName: z.string().optional(),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  referralCode: z.string().optional(),
})

export type SignupFormState = {
  success: boolean
  message: string
  referralCredited?: boolean
  referralAmount?: number
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
        priority: 'high',
      })
    }
  }

  revalidatePath('/')

  return {
    success: true,
    message: 'Signup successful!',
    referralCredited: referralResult?.credited || false,
    referralAmount: referralResult?.amount || 0,
  }
}
