
import { getTransporter } from './config'
import nodemailer from 'nodemailer'
import { templates } from './templates'
import { EmailAttachment, SendEmailOptions } from './types'
import { createAdminClient } from '@/lib/supabase/admin'

export class MailService {
    private static async send(options: SendEmailOptions, metadata?: any) {
        const transporter = getTransporter()
        const { to, subject, html, text, attachments } = options

        try {
            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM, // Ensure default from is used if not provided
                to,
                subject,
                html,
                text,
                attachments: attachments?.map(a => ({
                    filename: a.filename,
                    content: a.content,
                    contentType: a.contentType
                }))
            })

            // Log success
            await this.logEmail(to, subject, 'sent', undefined, metadata)

            return { success: true, messageId: info.messageId }

        } catch (error: any) {
            // Log failure
            await this.logEmail(to, subject, 'failed', error.message, metadata)
            return { success: false, error: error.message }
        }
    }

    private static async logEmail(
        to: string | string[],
        template: string,
        status: 'sent' | 'failed',
        error?: string,
        metadata?: any
    ) {
        try {
            const supabase = await createAdminClient()
            const recipient = Array.isArray(to) ? to.join(', ') : to

            // We purposefully don't await this to avoid blocking, 
            // but in serverless we might need to await to ensure execution.
            // For safety in Next.js API routes, we await.
            await supabase.from('email_logs').insert({
                recipient,
                template_id: template, // reusing subject as template identifier mainly
                status,
                error,
                metadata,
                created_at: new Date().toISOString()
            })
        } catch (err) {
            console.warn('Failed to log email:', err)
        }
    }

    static async sendSubscriptionConfirmation(
        email: string,
        userName: string,
        planName: string,
        endDate: string,
        pdfBuffer: Buffer
    ) {
        const template = templates.subscriptionConfirmation(userName, planName, endDate)
        return this.send({
            to: email,
            ...template,
            attachments: [{
                filename: 'Contract_Note.pdf',
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        }, { type: 'subscription_confirmation', planName })
    }

    static async sendSubscriptionReminder(
        email: string,
        userName: string,
        daysLeft: number,
        endDate: string
    ) {
        const template = templates.subscriptionReminder(userName, daysLeft, endDate)
        return this.send({
            to: email,
            ...template
        }, { type: 'subscription_reminder', daysLeft, expiryDate: endDate })
    }

    static async sendOtp(email: string, otp: string) {
        const template = templates.otpCode(otp)
        return this.send({
            to: email,
            ...template
        }, { type: 'auth_otp' })
    }

    static async sendEnquiryAlert(email: string, userName: string, count: number) {
        const template = templates.enquiryAlert(userName, count)
        return this.send({
            to: email,
            ...template
        }, { type: 'enquiry_alert', count })
    }

    static async sendOrderStatus(
        email: string,
        customerName: string,
        orderId: string,
        status: string,
        isUpdate = false
    ) {
        const template = templates.orderStatus(customerName, orderId, status, isUpdate)
        return this.send({
            to: email,
            ...template
        }, { type: 'order_status', orderId, status })
    }

    static async sendOrderAlert(email: string, userName: string, count: number) {
        const template = templates.orderAlert(userName, count)
        return this.send({
            to: email,
            ...template
        }, { type: 'order_alert', count })
    }
}
