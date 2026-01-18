'use client'

import { useState, useEffect } from 'react'

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        // Set initial status
        setIsOnline(navigator.onLine)

        // Event listeners
        const handleOnline = () => {
            setIsOnline(true)
            // Dispatch custom event for other components
            window.dispatchEvent(new CustomEvent('app-online'))
        }

        const handleOffline = () => {
            setIsOnline(false)
            // Dispatch custom event for other components
            window.dispatchEvent(new CustomEvent('app-offline'))
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return isOnline
}
