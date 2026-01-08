import { OrdersClient } from './OrdersClient'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersClient />
    </Suspense>
  )
}
