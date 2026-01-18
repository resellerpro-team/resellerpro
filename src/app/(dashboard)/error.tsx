'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const isNetworkError = error.message.includes('fetch failed') || error.message.includes('Network')

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4 text-center">
      <div className="bg-red-50 p-4 rounded-full mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">
        {isNetworkError ? 'Connection Issue' : 'Something went wrong!'}
      </h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {isNetworkError
          ? 'We couldn\'t load your data. Please check your internet connection and try again.'
          : 'An unexpected error occurred. We\'ve notified our team.'}
      </p>
      <Button onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
