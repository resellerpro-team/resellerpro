
import { createAdminClient } from '@/lib/supabase/admin'
import { MailService } from '@/lib/mail'
import { addMinutes } from 'date-fns'
import crypto from 'crypto'

export class OtpService {
    /**
     * Generates a 6-digit OTP, stores it, and sends via email.
     */
    static async sendOtp(email: string) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        // Hash OTP for security (simple SHA256)
        // In production, use bcrypt or similar if high security needed, but for OTP SHA256 is fast and sufficient for short life.
        // However, to display it we need the plain version. We store the hash.
        // Wait, if we send it, we need the plain text. We send plain, store hash.
        const hash = crypto.createHash('sha256').update(otp).digest('hex')

        const supabase = await createAdminClient()
        const expiresAt = addMinutes(new Date(), 5).toISOString()

        // Store in DB
        const { error } = await supabase.from('auth_otps').insert({
            email,
            otp_code: hash, // Storing hash
            expires_at: expiresAt,
            verified: false
        })

        if (error) {
            console.error('OTP Store Error:', error)
            // Handle missing table error specifically
            if (error.message.includes('schema cache') || error.message.includes('relation "auth_otps" does not exist')) {
                throw new Error('System Error: The OTP table is missing in the database. Please contact support or run migrations.')
            }
            throw new Error(`Failed to store OTP: ${error.message}`)
        }

        // Send Email
        const result = await MailService.sendOtp(email, otp)
        if (!result.success) {
            // Fallback for Development: Log OTP to console if email fails
            if (process.env.NODE_ENV !== 'production') {
                return true
            }

            throw new Error(`Failed to send OTP email: ${result.error}`)
        }

        return true
    }

    /**
     * Verifies the OTP for a given email.
     */
    static async verifyOtp(email: string, code: string) {
        const supabase = await createAdminClient()
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
            return false
        }

        // Mark as verified (or delete)
        await supabase
            .from('auth_otps')
            .update({ verified: true })
            .eq('id', data.id)

        return true
    }
}
