'use client'

import { useVerification } from '@/components/auth/VerificationProvider'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface VerifiedPageGuardProps {
    children: React.ReactNode
    fallback?: React.ReactNode // Optional custom fallback UI
}

export function VerifiedPageGuard({ children, fallback }: VerifiedPageGuardProps) {
    const { isVerified, openVerificationModal, checkVerification } = useVerification()
    const router = useRouter()

    useEffect(() => {
        // If not verified, open modal immediately
        if (!isVerified) {
            openVerificationModal()
        }
    }, [isVerified, openVerificationModal])

    if (isVerified) {
        return <>{children}</>
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            {fallback || (
                <div className="text-center space-y-2">
                    <h2 className="text-lg font-semibold">Verification Required</h2>
                    <p className="text-muted-foreground">Please verify your email to access this page.</p>
                </div>
            )}
        </div>
    )
}
