'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { headers } from 'next/headers'

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
     4️⃣ Create Auth user
  -------------------------------- */

  const { data: authData, error: signUpError } =
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          business_name: businessName ?? '',
          phone,
          referral_code: referralCode
            ? referralCode.trim().toUpperCase()
            : null,
        },
      },
    })

  if (signUpError) {
    console.error('❌ AUTH SIGNUP ERROR:', signUpError.message)
    return {
      success: false,
      message: signUpError.message,
    }
  }

  if (!authData.user) {
    console.error('❌ AUTH USER NOT CREATED')
    return {
      success: false,
      message: 'Signup failed: User not created.',
    }
  }

  /* -------------------------------
     5️⃣ Log IP usage AFTER success
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
     6️⃣ PROCESS REFERRAL (FIXED - with proper delay and retry)
  -------------------------------- */
  let referralResult: any = null

  if (referralCode && referralCode.trim()) {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Increased to 1 second

    try {
      let attempts = 0
      const maxAttempts = 3

      while (attempts < maxAttempts && !referralResult?.credited) {
        attempts++
        const { data: referralData, error: referralError } = await supabase
          .rpc('process_signup_referral', {
            p_user_id: authData.user.id
          })

        if (referralError) {
          console.error(`⚠️ Referral attempt ${attempts} error:`, referralError.message)

          // Wait before retry
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        } else {
          referralResult = referralData
          // If successful or definitely failed (invalid code), break
          if (referralData?.credited || referralData?.message === 'Invalid referral code') {
            break
          }
        }
      }

    } catch (error: any) {
      console.error('⚠️ REFERRAL ERROR (non-critical):', error.message)
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