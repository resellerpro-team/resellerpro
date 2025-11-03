export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ProfileForm from '@/components/settings/ProfileForm'

export const metadata = {
  title: 'Profile Settings - ResellerPro',
  description: 'Manage your profile information',
}

export default async function ProfilePage() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch user profile from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
  }

  // Combine user auth data with profile data
  const userData = {
    id: user.id,
    email: user.email || '',
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    avatar_url: profile?.avatar_url || '',
    business_name: profile?.business_name || '',
    created_at: user.created_at,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your profile details. Your email cannot be changed for security reasons.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={userData} />
        </CardContent>
      </Card>
    </div>
  )
}