'use client'

import { useVerification } from '@/components/auth/VerificationProvider'

export function useRequireVerification() {
    const { checkVerification } = useVerification()

    /**
     * Wraps an async handler function with a verification check.
     * If user is not verified, the handler is not executed and the modal opens.
     */
    const withVerification = <T extends any[], R>(
        handler: (...args: T) => Promise<R> | R
    ) => {
        return async (...args: T): Promise<R | undefined> => {
            if (!checkVerification()) {
                return undefined
            }
            return handler(...args)
        }
    }

    return {
        checkVerification,
        withVerification
    }
}
