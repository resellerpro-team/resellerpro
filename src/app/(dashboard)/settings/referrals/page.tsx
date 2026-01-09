import { Suspense } from 'react'
import ReferralsClient from './ReferralsClient'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Referrals - ResellerPro',
    description: 'Invite friends and earn credits',
}

export default function ReferralsPage() {
    return (
        <Suspense>
            <ReferralsClient />
        </Suspense>
    )
}
