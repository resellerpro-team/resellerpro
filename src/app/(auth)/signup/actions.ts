'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { headers } from 'next/headers'

// Validation schema
const SignupSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  businessName: z.string().optional(),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

export type SignupFormState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export async function signup(
  prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {

  const supabase = await createClient()

  // 1️⃣ Get IP
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0] ||
    headersList.get('x-real-ip') ||
    'unknown'

  // 2️⃣ Check IP limit (max 2 lifetime)
  const { count: ipCount } = await supabase
    .from('signup_ip_log')
    .select('id', { count: 'exact' })
    .eq('ip_address', ip)

  if ((ipCount ?? 0) >= 2) {
    return {
      success: false,
      message: 'You already have an account on ResellerPro. Please login.',
    }
  }

  // 3️⃣ Validate fields
  const validatedFields = SignupSchema.safeParse({
    fullName: formData.get('fullName'),
    businessName: formData.get('businessName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, fullName, businessName, phone } = validatedFields.data

  // 4️⃣ Create Supabase Auth user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        business_name: businessName,
        phone,
      },
    },
  })

  if (signUpError) {
    const msg = signUpError.message.includes('unique')
      ? 'This phone number or email is already used.'
      : signUpError.message

    return { success: false, message: msg }
  }

  if (!authData.user) {
    return { success: false, message: 'Signup failed: User not created.' }
  }

  // 5️⃣ Log IP usage AFTER success
  await supabase.from('signup_ip_log').insert({
    ip_address: ip,
  })

  // 6️⃣ DO NOT redirect here — let client handle
  revalidatePath('/')

  return { success: true, message: 'Signup successful!' }
}
