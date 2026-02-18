
import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import styles from '@/styles/EnquiryPopup.module.css'

interface FormData {
    name: string
    whatsapp: string
    email: string
    message: string
}

export default function EnquiryForm() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        whatsapp: '',
        email: '',
        message: ''
    })
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('submitting')

        try {
            const res = await fetch('/api/enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error('Failed to submit')

            setStatus('success')
        } catch (error) {
            console.error(error)
            setStatus('error')
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name } = e.target
        let { value } = e.target

        if (name === 'whatsapp') {
            // Only allow digits 0-9
            value = value.replace(/\D/g, '')
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    if (status === 'success') {
        return (
            <div className={styles.successMessage}>
                <span className={styles.successIcon}>✅</span>
                <h3>Thank you!</h3>
                <p>We'll contact you shortly on WhatsApp.</p>
            </div>
        )
    }

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
                <label className={styles.label}>Name *</label>
                <input
                    className={styles.input}
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>WhatsApp Number *</label>
                <input
                    className={styles.input}
                    name="whatsapp"
                    required
                    type="tel"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Email *</label>
                <input
                    className={styles.input}
                    name="email"
                    required
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Message</label>
                <textarea
                    className={`${styles.input} ${styles.textarea}`}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                />
            </div>

            <button
                className={styles.submitButton}
                type="submit"
                disabled={status === 'submitting'}
            >
                {status === 'submitting' ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                    </>
                ) : (
                    <>
                        <MessageSquare className="w-5 h-5" />
                        <span>Start Chat on WhatsApp</span>
                    </>
                )}
            </button>

            {status === 'error' && (
                <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '10px' }}>
                    Something went wrong. Please try again.
                </p>
            )}
        </form>
    )
}
