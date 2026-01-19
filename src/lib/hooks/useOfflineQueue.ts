'use client'

import { useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

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
    const { toast } = useToast()

    // Add action to queue
    const queueAction = useCallback((type: string, payload: any) => {
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

            toast({
                title: 'Action Queued',
                description: 'This action will sync when you\'re back online.',
                duration: 2000,
            })
        } catch (error) {
            console.error('Failed to queue action:', error)
        }
    }, [toast])

    // Get queue from localStorage
    const getQueue = useCallback((): QueuedAction[] => {
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
        try {
            localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
        } catch (error) {
            console.error('Failed to save queue:', error)
        }
    }, [])

    // Process queue when online
    const processQueue = useCallback(async () => {
        const queue = getQueue()
        if (queue.length === 0) return

        toast({
            title: 'Syncing...',
            description: `Processing ${queue.length} pending action${queue.length > 1 ? 's' : ''}`,
        })

        const newQueue: QueuedAction[] = []
        let successCount = 0
        let failCount = 0

        for (const action of queue) {
            try {
                // Execute the action based on type
                await executeAction(action)
                successCount++
            } catch (error) {
                console.error(`Failed to execute action ${action.id}:`, error)

                // Retry logic
                if (action.retries < MAX_RETRIES) {
                    newQueue.push({ ...action, retries: action.retries + 1 })
                } else {
                    failCount++
                }
            }
        }

        saveQueue(newQueue)

        // Show result toast
        if (successCount > 0) {
            toast({
                title: '✅ Synced',
                description: `${successCount} action${successCount > 1 ? 's' : ''} synced successfully`,
            })
        }

        if (failCount > 0) {
            toast({
                title: 'Sync Failed',
                description: `${failCount} action${failCount > 1 ? 's' : ''} could not be synced`,
                variant: 'destructive',
            })
        }
    }, [getQueue, saveQueue, toast])

    // Execute individual action
    const executeAction = async (action: QueuedAction) => {
        // This will be extended based on action type
        // For now, just a placeholder
        console.log('Executing queued action:', action.type, action.payload)

        // TODO: Implement actual action execution
        // Example: if (action.type === 'CREATE_ORDER') { await createOrder(action.payload) }
    }

    // Listen for online event and process queue
    useEffect(() => {
        const handleOnline = () => {
            processQueue()
        }

        window.addEventListener('app-online', handleOnline)
        return () => window.removeEventListener('app-online', handleOnline)
    }, [processQueue])

    return {
        queueAction,
        getQueue,
        pendingCount: getQueue().length,
    }
}
