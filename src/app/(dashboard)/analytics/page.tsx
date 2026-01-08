import { Suspense } from 'react'
import { AnalyticsClient } from './AnalyticsClient'

// Force dynamic is needed because AnalyticsClient uses useSearchParams
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Analytics - ResellerPro',
  description: 'Detailed analytics and reports for your business',
}

export default function AnalyticsPage() {
  return (
    <Suspense>
      <AnalyticsClient />
    </Suspense>
  )
}