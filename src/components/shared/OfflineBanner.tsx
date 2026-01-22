'use client'

import { useEffect, useState } from 'react'
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'
import { AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  const [show, setShow] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    // Check for pending actions in queue
    try {
      const queue = localStorage.getItem('offline-queue')
      if (queue) {
        const actions = JSON.parse(queue)
        setPendingCount(actions.length)
      }
    } catch (error) {
      console.error('Failed to read offline queue:', error)
    }
  }, [isOnline])

  useEffect(() => {
    if (!isOnline) {
      setShow(true)
      setWasOffline(true)
    } else {
      // If we were offline and now online, show success briefly
      if (wasOffline) {
        setShow(true)
        const timer = setTimeout(() => {
          setShow(false)
          setWasOffline(false)
        }, 3000)
        return () => clearTimeout(timer)
      } else {
        setShow(false)
      }
    }
  }, [isOnline, wasOffline])

  if (!show) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-300">
      <Alert
        className={`rounded-none border-x-0 border-t-0 ${
          isOnline
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-orange-50 border-orange-200 text-orange-800'
        }`}
      >
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <AlertDescription className="flex items-center justify-between w-full">
            <span className="font-medium">
              {isOnline ? (
                'Back online!'
              ) : (
                <>
                  You're offline
                  {pendingCount > 0 && ` • ${pendingCount} action${pendingCount > 1 ? 's' : ''} pending`}
                </>
              )}
            </span>
            {!isOnline && (
              <span className="text-xs opacity-75">
                Changes will sync when connection is restored
              </span>
            )}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  )
}
