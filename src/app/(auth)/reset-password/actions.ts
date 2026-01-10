'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const ResetPasswordSchema = z.object({
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
})

export type ResetPasswordFormState = {
    success: boolean
    message: string
    errors?: Record<string, string[] | undefined>
}

export async function updatePassword(
    prevState: ResetPasswordFormState,
    formData: FormData
): Promise<ResetPasswordFormState> {
    const supabase = await createClient()

    // Validate input
    const validatedFields = ResetPasswordSchema.safeParse({
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
    })

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Please check your password entries.',
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { password } = validatedFields.data

    try {
        // Update password
        const { error } = await supabase.auth.updateUser({
            password: password,
        })

        if (error) {
            console.error('Password update error:', error)

            // Handle specific error cases
            if (error.message.includes('session')) {
                return {
                    success: false,
                    message: 'Reset link expired or invalid. Please request a new password reset.',
                }
            }

            return {
                success: false,
                message: error.message || 'Failed to update password. Please try again.',
            }
        }

        // Success - redirect to login will happen on client side
        return {
            success: true,
            message: 'Password updated successfully! Redirecting to login...',
        }
    } catch (error) {
        console.error('Unexpected error:', error)
        return {
            success: false,
            message: 'An unexpected error occurred. Please try again later.',
        }
    }
}
