'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
})

export type LoginFormState = {
  success: boolean
  message: string
  errors?: Record<string, string[] | undefined>
}

export async function login(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {

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
    if (error.message === 'Invalid login credentials') {
      return {
        success: false,
        message: 'Incorrect email or password.',
      }
    }

    return {
      success: false,
      message: `Login error: ${error.message}`,
    }
  }

  // ----------------------------------------------
  // 6️⃣ SUCCESS — CLEAN UP IF YOU WANT (optional)
  // ----------------------------------------------
  revalidatePath('/')
  redirect('/dashboard')
}
