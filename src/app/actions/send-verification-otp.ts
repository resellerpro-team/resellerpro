'use server'

import { OtpService } from '@/lib/auth/otp'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const SendOtpSchema = z.object({
    email: z.string().email(),
})

export async function sendVerificationOtp(email: string) {
    const parsed = SendOtpSchema.safeParse({ email })
    if (!parsed.success) {
        return { success: false, message: 'Please enter a valid email address.' }
    }

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, message: 'You must be logged in to request verification.' }
        }

        // Optional: Check if already verified
        const { data: profile } = await supabase
            .from('profiles')
            .select('email_verified')
            .eq('id', user.id)
            .single()

        if (profile?.email_verified) {
            return { success: true, message: 'Email is already verified.', alreadyVerified: true }
        }

        await OtpService.sendOtp(email)
        return { success: true, message: 'OTP sent to your email.' }
    } catch (error: any) {
        console.error('OTP Send Error:', error)
        return { success: false, message: error.message || 'Failed to send OTP.' }
    }
}

export async function getRecentOtpStatus(email: string) {
    const parsed = SendOtpSchema.safeParse({ email })
    if (!parsed.success) {
        return { hasRecentOtp: false }
    }

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { hasRecentOtp: false }
        }

        const recentOtp = await OtpService.getRecentOtp(email)

        if (recentOtp) {
            const createdAt = new Date(recentOtp.created_at)
            const now = new Date()
            const elapsedSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000)
            const remainingSeconds = Math.max(0, 300 - elapsedSeconds)

            return {
                hasRecentOtp: true,
                remainingSeconds,
            }
        }

        return { hasRecentOtp: false }
    } catch (error) {
        console.error('Check Recent OTP Error:', error)
        return { hasRecentOtp: false }
    }
}
