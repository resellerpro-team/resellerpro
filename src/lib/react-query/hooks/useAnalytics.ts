import { useQuery } from '@tanstack/react-query'

export function useAnalytics(
    params: { from?: string; to?: string },
    options?: { enabled?: boolean }
) {
    const queryString = new URLSearchParams()
    if (params.from) queryString.set('from', params.from)
    if (params.to) queryString.set('to', params.to)

    return useQuery({
        queryKey: ['analytics', params],
        queryFn: async () => {
            const res = await fetch(`/api/analytics?${queryString.toString()}`)
            if (!res.ok) throw new Error('Failed to fetch analytics')
            return res.json()
        },
        enabled: options?.enabled ?? true,  // Default to true if not specified
    })
}
