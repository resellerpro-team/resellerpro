'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type SubscriptionStatus = {
    isPremium: boolean
    isLoading: boolean
    planName: string | null
    status: string | null
}

/**
 * Hook to check if user has an active premium subscription
 * Returns isPremium, isLoading, planName, and status
 */
export function useSubscription(): SubscriptionStatus {
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
        isPremium: false,
        isLoading: true,
        planName: null,
        status: null,
    })

    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const supabase = createClient()

                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    setSubscriptionStatus({
                        isPremium: false,
                        isLoading: false,
                        planName: null,
                        status: null,
                    })
                    return
                }

                // Fetch subscription with current_period_end for expiration check
                const { data: subscription } = await supabase
                    .from('user_subscriptions')
                    .select('plan_id, status, current_period_end, subscription_plans(name, display_name)')
                    .eq('user_id', user.id)
                    .single()

                const planName = (subscription?.subscription_plans as any)?.name || 'free'

                // STRICT CHECK: Must be active + paid plan + NOT expired
                const isActive = subscription?.status === 'active'
                const isPaidPlan = planName !== 'free'
                const isNotExpired = subscription?.current_period_end
                    ? new Date(subscription.current_period_end) > new Date()
                    : false

                // All three conditions must be true for premium access
                const isPremium = isActive && isPaidPlan && isNotExpired

                setSubscriptionStatus({
                    isPremium,
                    isLoading: false,
                    planName,
                    status: subscription?.status || null,
                })
            } catch (error) {
                console.error('Error checking subscription:', error)
                setSubscriptionStatus({
                    isPremium: false,
                    isLoading: false,
                    planName: null,
                    status: null,
                })
            }
        }

        checkSubscription()
    }, [])

    return subscriptionStatus
}
