import { Suspense } from 'react'
import { ProfileClient } from './ProfileClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Profile Settings - ResellerPro',
  description: 'Manage your profile information',
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileClient />
    </Suspense>
  )
}