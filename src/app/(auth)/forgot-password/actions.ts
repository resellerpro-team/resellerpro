'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const ForgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
})

export type ForgotPasswordFormState = {
    success: boolean
    message: string
    errors?: Record<string, string[] | undefined>
}

export async function sendResetEmail(email: string) {
    const supabase = await createClient()

    // Validate input
    const validatedFields = ForgotPasswordSchema.safeParse({ email })

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Invalid email address.',
        }
    }

    try {
        // Use simple redirect without PKCE - this works cross-browser!
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000'}/reset-password`,
        })

        if (error) {
            console.error('Password reset error:', error)

            // Handle specific errors
            if (error.message.includes('rate limit') || error.message.includes('request this after')) {
                return {
                    success: false,
                    message: 'Too many reset requests. Please wait 60 seconds before trying again.',
                }
            }

            return {
                success: false,
                message: 'Failed to send reset email. Please try again.',
            }
        }

        return {
            success: true,
            message: 'Password reset link has been sent to your email. Please check your inbox and open the link in THIS browser (not a different one).',
        }
    } catch (error) {
        console.error('Unexpected error:', error)
        return {
            success: false,
            message: 'An unexpected error occurred. Please try again later.',
        }
    }
}
