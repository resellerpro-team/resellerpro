'use client'

import { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVerification } from '@/components/auth/VerificationProvider'

interface VerificationBannerProps {
    email: string
    isVerified: boolean
}

export function VerificationBanner({ email, isVerified }: VerificationBannerProps) {
    const { openVerificationModal } = useVerification()
    const [isVisible, setIsVisible] = useState(true)

    if (isVerified || !isVisible) return null

    return (
        <>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-900 px-4 py-3 relative">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                            Please verify your email address to unlock all features.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={openVerificationModal}
                            className="bg-white border-yellow-300 text-yellow-800 hover:bg-yellow-50 hover:text-yellow-900 dark:bg-transparent dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/50 h-8 text-xs font-semibold"
                        >
                            Verify Now
                        </Button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
