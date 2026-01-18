
import nodemailer from 'nodemailer'
import { MailConfig } from './types'

// Default to a development Ethereal account if envs are missing in dev
// In prod, these MUST be present.
export const getMailConfig = (): MailConfig => {
    return {
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER || 'ethereal_user',
            pass: process.env.SMTP_PASS || 'ethereal_pass',
        },
        from: process.env.SMTP_FROM || '"ResellerPro" <noreply@resellerpro.com>',
    }
}

// Singleton transporter
let transporter: nodemailer.Transporter | null = null

export const getTransporter = () => {
    if (transporter) return transporter

    const config = getMailConfig()
    transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth,
    })

    return transporter
}
