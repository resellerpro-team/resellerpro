'use client'

import { useEffect, useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface QueuedAction {
    id: string
    type: string
    payload: any
    timestamp: number
    retries: number
}

const MAX_RETRIES = 3
const QUEUE_KEY = 'offline-queue'

export function useOfflineQueue() {
    const queryClient = useQueryClient()
    // Reactive online/offline state
    const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true)

    // Get queue from localStorage
    const getQueue = useCallback((): QueuedAction[] => {
        if (typeof window === 'undefined') return [] // SSR guard

        try {
            const stored = localStorage.getItem(QUEUE_KEY)
            return stored ? JSON.parse(stored) : []
        } catch (error) {
            console.error('Failed to read queue:', error)
            return []
        }
    }, [])

    // Save queue to localStorage
    const saveQueue = useCallback((queue: QueuedAction[]) => {
        if (typeof window === 'undefined') return // SSR guard

        try {
            localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
        } catch (error) {
            console.error('Failed to save queue:', error)
        }
    }, [])

    // Add action to queue
    const queueAction = useCallback((type: string, payload: any) => {
        if (typeof window === 'undefined') return // SSR guard

        try {
            const queue = getQueue()
            const action: QueuedAction = {
                id: `${Date.now()}-${Math.random()}`,
                type,
                payload,
                timestamp: Date.now(),
                retries: 0,
            }
            queue.push(action)
            localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))

            toast.success('Queued for sync', {
                description: 'This will sync automatically when you\'re back online.',
            })
        } catch (error) {
            console.error('Failed to queue action:', error)
        }
    }, [getQueue])

    // Execute individual action
    const executeAction = async (action: QueuedAction) => {

        switch (action.type) {
            case 'CREATE_CUSTOMER': {
                const response = await fetch('/api/customers', {
                    method: 'POST',
                    body: JSON.stringify(action.payload),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    console.error('❌ Failed to create customer:', response.status, errorText)
                    throw new Error(`Failed to create customer: ${response.statusText}`)
                }

                const result = await response.json()
                break
            }

            case 'CREATE_ORDER': {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    body: JSON.stringify(action.payload),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) {
                    throw new Error(`Failed to create order: ${response.statusText}`)
                }
                break
            }

            case 'CREATE_PRODUCT': {
                const response = await fetch('/api/products', {
                    method: 'POST',
                    body: JSON.stringify(action.payload),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) {
                    throw new Error(`Failed to create product: ${response.statusText}`)
                }
                break
            }

            default:
                console.warn(`Unknown action type: ${action.type}`)
        }
    }

    // Process queue when online
    const processQueue = useCallback(async () => {
        const queue = getQueue()
        if (queue.length === 0) return

        toast.loading(`Syncing ${queue.length} item${queue.length > 1 ? 's' : ''}...`, {
            id: 'sync-toast'
        })

        const newQueue: QueuedAction[] = []
        let successCount = 0
        let failCount = 0
        const syncedTypes = new Set<string>() // Track what types were synced

        for (const action of queue) {
            try {
                await executeAction(action)
                successCount++
                syncedTypes.add(action.type) // Track successful sync type
            } catch (error: any) {
                console.error(`Failed to execute action ${action.id}:`, error)

                // Check if it's a duplicate error (409)
                const isDuplicate = error.message?.includes('409') || error.message?.includes('duplicate')

                if (isDuplicate) {
                    successCount++ //Count as success so we don't fail the whole sync
                } else if (action.retries < MAX_RETRIES) {
                    // Retry logic for real errors
                    newQueue.push({ ...action, retries: action.retries + 1 })
                } else {
                    failCount++
                }
            }
        }

        saveQueue(newQueue)

        // 🔄 Invalidate React Query cache for synced data types
        if (typeof window !== 'undefined' && successCount > 0) {
            // Trigger a custom event that components can listen to
            const event = new CustomEvent('offline-queue-synced', {
                detail: { types: Array.from(syncedTypes), count: successCount }
            })
            window.dispatchEvent(event)

            // Also trigger a page reload cache invalidation
            if (syncedTypes.has('CREATE_CUSTOMER')) {
                // Force refetch by dispatching storage event (React Query listens to this)
                window.dispatchEvent(new Event('online'))
            }
        }

        // Show result toast
        toast.dismiss('sync-toast')

        if (successCount > 0) {
            toast.success('Synced successfully! ✨', {
                description: `${successCount} item${successCount > 1 ? 's' : ''} synced`,
                duration: 2000,
            })

            // Invalidate React Query cache for instant refresh
            queryClient.invalidateQueries({ queryKey: ['customers'] })
        }

        if (failCount > 0) {
            toast.error('Some items failed to sync', {
                description: `${failCount} item${failCount > 1 ? 's' : ''} could not be synced`,
            })
        }
    }, [getQueue, saveQueue, queryClient])

    // Listen for online/offline events
    useEffect(() => {
        setIsOnline(navigator.onLine)

        const handleOnline = () => {
            setIsOnline(true)
            processQueue()
        }

        const handleOffline = () => {
            setIsOnline(false)
            toast.info('You\'re offline', {
                description: 'Changes will be queued and synced when you\'re back online.',
            })
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Also process queue on mount if online
        if (navigator.onLine) {
            const queue = getQueue()
            if (queue.length > 0) {
                processQueue()
            }
        }

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [processQueue, getQueue])

    return {
        queueAction,
        getQueue,
        pendingCount: getQueue().length,
        isOnline,
    }
}
