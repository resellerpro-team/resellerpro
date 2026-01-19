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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="bg-red-50 p-4 rounded-full mb-6">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-3 tracking-tight">Something went wrong!</h2>
        <p className="text-muted-foreground mb-8">
          {error.message || "An unexpected error occurred. We've notified our team."}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Go Home
          </Button>
          <Button onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
}