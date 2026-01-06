import { useQuery } from '@tanstack/react-query'

export function useProfile() {
    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await fetch('/api/settings/profile')
            if (!res.ok) throw new Error('Failed to fetch profile')
            return res.json()
        },
    })
}
