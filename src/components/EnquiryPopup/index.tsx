
'use client'

import { useEffect, useRef } from 'react'
import { usePopupController } from '@/hooks/usePopupController'
import EnquiryForm from './EnquiryForm'
import styles from '@/styles/EnquiryPopup.module.css'

export default function EnquiryPopup() {
    const { isVisible, closePopup } = usePopupController()
    const popupRef = useRef<HTMLDivElement>(null)

    // Handle ESC key to close
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closePopup()
            }
        }

        if (isVisible) {
            document.addEventListener('keydown', handleEscKey)
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey)
        }
    }, [isVisible, closePopup])

    if (!isVisible) return null

    return (
        <div className={styles.popupOverlay}>
            <div className={styles.popupContainer} ref={popupRef}>
                <div className={styles.header}>
                    <h3 className={styles.headerTitle}>Have questions?</h3>
                    <button className={styles.closeButton} onClick={closePopup} aria-label="Close popup">
                        ✕
                    </button>
                </div>
                <EnquiryForm />
            </div>
        </div>
    )
}
