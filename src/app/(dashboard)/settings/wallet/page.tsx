import { Suspense } from 'react'
import WalletClient from './WalletClient'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Wallet - ResellerPro',
    description: 'Manage your wallet balance',
}

export default function WalletPage() {
    return (
        <Suspense>
            <WalletClient />
        </Suspense>
    )
}
