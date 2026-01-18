'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Crown, Calendar, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FreePlanBannerProps {
  daysLimit: number
  showingDays: number
}

export function FreePlanBanner({ daysLimit, showingDays }: FreePlanBannerProps) {
  const router = useRouter()

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
      <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 absolute left-4 top-4" />
      <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ml-6 sm:ml-0">
        <div className="flex items-start sm:items-center gap-2 flex-1">
          <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-0 hidden sm:block" />
          <span className="text-sm text-amber-900 dark:text-amber-100">
            <strong>Free Plan:</strong> Viewing last {showingDays} days only. 
            Upgrade to see unlimited history{showingDays > 30 ? ' and compare periods' : ' and access all historical data'}.
          </span>
        </div>
        <Button 
          size="sm"
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shrink-0 w-full sm:w-auto mt-2 sm:mt-0"
          onClick={() => router.push('/settings/subscription')}
        >
          <Crown className="mr-2 h-4 w-4" />
          Upgrade
        </Button>
      </AlertDescription>
    </Alert>
  )
}
