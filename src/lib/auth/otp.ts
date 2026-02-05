
import { createAdminClient } from '@/lib/supabase/admin'
import { MailService } from '@/lib/mail'
import { addMinutes } from 'date-fns'
import crypto from 'crypto'

export class OtpService {
    /**
     * Generates a 6-digit OTP, stores it, and sends via email.
     */
    static async sendOtp(email: string) {
        const supabase = await createAdminClient()

        // 1. Check for blocks
        const { data: attemptData } = await supabase
            .from('auth_otp_attempts')
            .select('*')
            .eq('email', email)
            .single()

        if (attemptData?.blocked_until) {
            const blockedUntil = new Date(attemptData.blocked_until)
            if (blockedUntil > new Date()) {
                const diff = Math.ceil((blockedUntil.getTime() - new Date().getTime()) / 1000 / 60)
                throw new Error(`Too many attempts. Please try again in ${diff} minutes.`)
            }
        }

        // 2. Rate Limit Check: 5 minutes cooldown
        // Check if there is a recently created OTP that hasn't expired (or just check creation time)
        // We'll check for any OTP created in the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

        const { data: recentOtp } = await supabase
            .from('auth_otps')
            .select('created_at')
            .eq('email', email)
            .gte('created_at', fiveMinutesAgo)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (recentOtp) {
            throw new Error('Please wait 5 minutes before requesting a new OTP.')
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        // Hash OTP for security (simple SHA256)
        // In production, use bcrypt or similar if high security needed, but for OTP SHA256 is fast and sufficient for short life.
        // However, to display it we need the plain version. We store the hash.
        // Wait, if we send it, we need the plain text. We send plain, store hash.
        const hash = crypto.createHash('sha256').update(otp).digest('hex')

        const expiresAt = addMinutes(new Date(), 5).toISOString()

        // 2. Track attempt
        const newCount = (attemptData?.attempt_count || 0) + 1
        let blockedUntil: string | null = null

        if (newCount >= 3) {
            blockedUntil = addMinutes(new Date(), 15).toISOString()
        }

        const { error: upsertError } = await supabase
            .from('auth_otp_attempts')
            .upsert({
                email,
                attempt_count: newCount,
                last_attempt_at: new Date().toISOString(),
                blocked_until: blockedUntil
            }, { onConflict: 'email' })

        if (upsertError) {
            console.error('OTP Attempt Upsert Error:', upsertError)
        }

        if (blockedUntil && newCount >= 3) {
            throw new Error('Too many attempts. Please try again in 15 minutes.')
        }

        // Store in DB
        const { error } = await supabase.from('auth_otps').insert({
            email,
            otp_code: hash,
            expires_at: expiresAt,
            verified: false
        })

        if (error) {
            console.error('OTP Store Error:', error)
            if (error.message.includes('schema cache') || error.message.includes('relation "auth_otps" does not exist')) {
                throw new Error('System Error: The OTP table is missing in the database.')
            }
            throw new Error(`Failed to store OTP: ${error.message}`)
        }

        // Send Email
        const result = await MailService.sendOtp(email, otp)
        if (!result.success) {
            if (process.env.NODE_ENV !== 'production') {
                return true
            }
            throw new Error(`Failed to send OTP email: ${result.error}`)
        }

        return true
    }

    /**
     * Gets the most recent valid (non-expired, non-verified) OTP for an email.
     */
    static async getRecentOtp(email: string) {
        const supabase = await createAdminClient()

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

        const { data: recentOtp } = await supabase
            .from('auth_otps')
            .select('*')
            .eq('email', email)
            .eq('verified', false)
            .gte('created_at', fiveMinutesAgo)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        return recentOtp || null
    }

    /**
     * Verifies the OTP for a given email.
     */
    static async verifyOtp(email: string, code: string) {
        const supabase = await createAdminClient()

        // 1. Check for blocks
        const { data: attemptData } = await supabase
            .from('auth_otp_attempts')
            .select('*')
            .eq('email', email)
            .single()

        if (attemptData?.blocked_until) {
            const blockedUntil = new Date(attemptData.blocked_until)
            if (blockedUntil > new Date()) {
                const diff = Math.ceil((blockedUntil.getTime() - new Date().getTime()) / 1000 / 60)
                throw new Error(`Too many attempts. Please try again in ${diff} minutes.`)
            }
        }

        const hash = crypto.createHash('sha256').update(code).digest('hex')

        // Find valid OTP
        const { data, error } = await supabase
            .from('auth_otps')
            .select('*')
            .eq('email', email)
            .eq('otp_code', hash)
            .eq('verified', false)
            .gt('expires_at', new Date().toISOString())
            .single()

        if (error || !data) {
            // Track failure
            const newFailCount = (attemptData?.failed_verifications || 0) + 1
            let blockedUntil: string | null = null

            if (newFailCount >= 3) {
                blockedUntil = addMinutes(new Date(), 15).toISOString()
            }

            await supabase
                .from('auth_otp_attempts')
                .upsert({
                    email,
                    failed_verifications: newFailCount,
                    blocked_until: blockedUntil
                }, { onConflict: 'email' })

            if (blockedUntil) {
                throw new Error('Too many failed attempts. Please try again in 15 minutes.')
            }

            return false
        }

        // Mark as verified
        await supabase
            .from('auth_otps')
            .update({ verified: true })
            .eq('id', data.id)

        // Reset attempts on success
        await supabase
            .from('auth_otp_attempts')
            .upsert({
                email,
                attempt_count: 0,
                failed_verifications: 0,
                blocked_until: null
            }, { onConflict: 'email' })

        return true
    }
}

