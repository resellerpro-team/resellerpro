import { Suspense } from 'react'
import { ProfileClient } from './ProfileClient'
import { createClient } from '@/lib/supabase/server'
import { Loader2 } from 'lucide-react'

// export const dynamic = 'force-dynamic' // Removed to allow caching

export const metadata = {
  title: 'Profile Settings - ResellerPro',
  description: 'Manage your profile information',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  
  if (user) {
    const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
    profile = data
  }

  return (
    <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <ProfileClient initialData={profile} />
    </Suspense>
  )
}