'use client'

import { useVerification } from '@/components/auth/VerificationProvider'
import { cn } from '@/lib/utils'

interface RequireVerificationProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    className?: string
}

export function RequireVerification({
    children,
    fallback,
    className
}: RequireVerificationProps) {
    const { isVerified, openVerificationModal } = useVerification()

    if (isVerified) {
        return <>{children}</>
    }

    // If fallback is provided and we are not verified, show fallback
    if (fallback) {
        return (
            <div
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    openVerificationModal()
                }}
                className={className}
            >
                {fallback}
            </div>
        )
    }

    // Overlay Pattern for Blocking Navigation
    // We wrap the children in a relative container.
    // An absolute overlay sits on top with z-index to capture clicks.
    // The children are set to pointer-events-none so they ignore clicks.
    return (
        <div className={cn("relative block w-full", className)}>
            {/* Blocking Overlay - Invisible but captures clicks */}
            <div
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    openVerificationModal()
                }}
            />

            {/* Content - Visuals only, no interaction, full opacity */}
            <div className="pointer-events-none">
                {children}
            </div>
        </div>
    )
}
