'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { markWelcomeShown } from './actions'

export function WelcomeToast() {
    const { toast } = useToast()
    const searchParams = useSearchParams()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('welcome') !== 'true') return

        const bonus = Number(params.get('bonus'))

        if (bonus > 0) {
            toast({
                title: '🎉 Account Created with Bonus!',
                description: `Welcome to ResellerPro! You've received ₹${bonus} wallet credit.`,
            })
        } else {
            toast({
                title: 'Account Created! 🎉',
                description: 'Welcome to ResellerPro.',
            })
        }

        // Mark welcome as shown
        markWelcomeShown()

        // Clean up URL params
        window.history.replaceState({}, '', '/dashboard')
    }, [toast])

    return null
}
