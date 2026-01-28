'use server'

import { OtpService } from '@/lib/auth/otp'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const SendOtpSchema = z.object({
    email: z.string().email(),
})

const VerifyOtpSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
})

export async function sendLoginOtp(email: string) {
    const parsed = SendOtpSchema.safeParse({ email })
    if (!parsed.success) {
        return { success: false, message: 'Please enter a valid email address.' }
    }

    try {
        await OtpService.sendOtp(email)
        return { success: true, message: 'OTP sent to your email.' }
    } catch (error: any) {
        console.error('OTP Send Error:', error)
        return { success: false, message: error.message || 'Failed to send OTP.' }
    }
}

export async function verifyLoginOtp(email: string, code: string) {
    const parsed = VerifyOtpSchema.safeParse({ email, code })
    if (!parsed.success) {
        return { success: false, message: 'Invalid format.' }
    }

    try {
        const isValid = await OtpService.verifyOtp(email, code)
        if (!isValid) {
            return { success: false, message: 'Invalid or expired OTP.' }
        }

        // Generate a session link to log the user in
        const supabase = await createAdminClient()

        // Ensure user exists first (optional, but generateLink might just work or error)
        // We'll try to generate the link directly.
        const { data, error } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
            }
        })

        if (error) {
            // Handle case where user might not exist?
            if (error.message.includes('User not found')) {
                return { success: false, message: 'No account found with this email.' }
            }
            throw error
        }

        if (!data.properties?.action_link) {
            throw new Error('Could not generate login link.')
        }


        return { success: true, redirectUrl: data.properties.action_link }

    } catch (error: any) {
        console.error('OTP Verify Error:', error)
        return { success: false, message: error.message || 'Verification failed.' }
    }
}
