
export interface EmailAttachment {
    filename: string
    content: Buffer | string
    contentType?: string
}

export interface SendEmailOptions {
    to: string | string[]
    subject: string
    html: string
    text?: string
    attachments?: EmailAttachment[]
    from?: string // Optional override
}

export interface EmailTemplate {
    subject: string
    html: string
    text: string
}

export interface MailConfig {
    host: string
    port: number
    secure: boolean
    auth: {
        user: string
        pass: string
    }
    from: string
}
