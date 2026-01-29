'use client'

import { useQuery } from '@tanstack/react-query'
import { getSubscriptionData } from '@/app/(dashboard)/settings/subscription/actions'

export function useSubscription() {
    return useQuery({
        queryKey: ['subscription'],
        queryFn: async () => {
            const data = await getSubscriptionData()
            return data
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    })
}
