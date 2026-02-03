import { useQuery, keepPreviousData } from '@tanstack/react-query'

export function useOrders(params: {
    search?: string
    status?: string
    payment?: string
    sort?: string
    page?: number
    limit?: number
}) {
    const queryString = new URLSearchParams()
    if (params.search) queryString.set('search', params.search)
    if (params.status) queryString.set('status', params.status)
    if (params.payment) queryString.set('payment', params.payment)
    if (params.sort) queryString.set('sort', params.sort)
    // Default page=1, limit=20 if not specified
    queryString.set('page', (params.page || 1).toString())
    queryString.set('limit', (params.limit || 20).toString())

    return useQuery({
        queryKey: ['orders', params],
        queryFn: async () => {
            const res = await fetch(`/api/orders?${queryString.toString()}`)
            if (!res.ok) throw new Error('Failed to fetch orders')
            return res.json()
        },
        placeholderData: keepPreviousData,
    })
}
