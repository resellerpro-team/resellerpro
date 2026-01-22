
import { useQuery } from '@tanstack/react-query'

export function useOrdersStats() {
    return useQuery({
        queryKey: ['orders-stats'],
        queryFn: async () => {
            const res = await fetch('/api/orders/stats')
            if (!res.ok) throw new Error('Failed to fetch order stats')
            return res.json()
        },
    })
}

export function useProductsStats() {
    return useQuery({
        queryKey: ['products-stats'],
        queryFn: async () => {
            const res = await fetch('/api/products/stats')
            if (!res.ok) throw new Error('Failed to fetch product stats')
            return res.json()
        },
    })
}

export function useCustomersStats() {
    return useQuery({
        queryKey: ['customers-stats'],
        queryFn: async () => {
            const res = await fetch('/api/customers/stats')
            if (!res.ok) throw new Error('Failed to fetch customer stats')
            return res.json()
        },
    })
}

export function useEnquiriesStats() {
    return useQuery({
        queryKey: ['enquiries-stats'],
        queryFn: async () => {
            const res = await fetch('/api/enquiries/stats')
            if (!res.ok) throw new Error('Failed to fetch enquiry stats')
            return res.json()
        },
    })
}
