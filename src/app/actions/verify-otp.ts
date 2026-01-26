'use server'

import { OtpService } from '@/lib/auth/otp'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const VerifyOtpSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
})

export async function verifyOtp(email: string, code: string) {
    const parsed = VerifyOtpSchema.safeParse({ email, code })
    if (!parsed.success) {
        return { success: false, message: 'Invalid format.' }
    }

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, message: 'You must be logged in to verify.' }
        }

        const isValid = await OtpService.verifyOtp(email, code)
        if (!isValid) {
            return { success: false, message: 'Invalid or expired OTP.' }
        }

        // Update profile
        const { error } = await supabase
            .from('profiles')
            .update({
                email_verified: true,
                // We can also mark welcome shown here if we want to treat verification as the "real" welcome
                // welcome_shown: true 
            })
            .eq('id', user.id)

        if (error) {
            console.error('Profile Update Error:', error)
            return { success: false, message: 'Failed to update profile verification status.' }
        }

        revalidatePath('/')
        return { success: true, message: 'Email verified successfully!' }

    } catch (error: any) {
        console.error('OTP Verify Error:', error)
        return { success: false, message: error.message || 'Verification failed.' }
    }
}
