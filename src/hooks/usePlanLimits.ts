'use client'

import { useSubscription } from '@/lib/react-query/hooks/useSubscription'
import { useState, useCallback } from 'react'

export type FeatureType = 'orders' | 'enquiries' | 'customers' | 'products'

export function usePlanLimits() {
    const { data: subscription, isLoading } = useSubscription()
    const [showLimitModal, setShowLimitModal] = useState(false)
    const [limitFeature, setLimitFeature] = useState<string>('')
    const [limitCount, setLimitCount] = useState<number>(0)

    const checkLimit = useCallback((feature: FeatureType): boolean => {
        if (!subscription || !subscription.metrics) return true // Assume optimistic allowed if loading? Or false? stick to safely allowed until loaded?
        // Actually if loading, we might want to block or disable. 
        // But for UX, maybe better to let them click and then fail/validate if data missing.
        // Let's rely on cached data.

        const metric = subscription.metrics[feature]
        if (!metric) return true // Unknown feature, allow

        if (metric.isReached) {
            setLimitFeature(feature)
            setLimitCount(metric.limit)
            setShowLimitModal(true)
            return false
        }

        return true
    }, [subscription])

    const planName = subscription?.plan?.display_name || 'Free Plan'

    return {
        subscription,
        isLoading,
        checkLimit,
        // Pre-calculated booleans for disabling buttons UI-wise
        canCreateOrder: !subscription?.metrics?.orders?.isReached,
        canCreateEnquiry: !subscription?.metrics?.enquiries?.isReached,
        canCreateCustomer: !subscription?.metrics?.customers?.isReached,
        canCreateProduct: !subscription?.metrics?.products?.isReached,
        // Modal State helpers
        limitModalProps: {
            isOpen: showLimitModal,
            onClose: () => setShowLimitModal(false),
            feature: limitFeature,
            limit: limitCount,
            planName: planName
        }
    }
}
