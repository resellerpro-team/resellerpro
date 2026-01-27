import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VerificationProvider } from '@/components/auth/VerificationProvider'

// Define the type for the user data we will pass down
type UserData = {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  planName?: string | null;
} | null

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If no user is logged in, redirect to login page immediately
  if (!user) {
    redirect('/signin')
  }

  // Fetch profile and subscription in parallel for better performance
  // Added email_verified to profile selection
  const [profileResult, subscriptionResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, avatar_url, email_verified')
      .eq('id', user.id)
      .single(),
    supabase
      .from('user_subscriptions')
      .select('plan:subscription_plans(display_name)')
      .eq('user_id', user.id)
      .single()
  ])

  const profile = profileResult.data
  const subscription = subscriptionResult.data

  // Prepare the user data object to pass to client components
  const userData: UserData = {
    name: profile?.full_name,
    email: user.email,
    avatarUrl: profile?.avatar_url,
    planName: (Array.isArray(subscription?.plan)
      ? subscription?.plan[0]?.display_name
      : (subscription?.plan as any)?.display_name) || 'Free Plan',
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Pass the fetched user data to the Sidebar component */}
      <Sidebar user={userData} />

      <VerificationProvider
        initialVerified={profile?.email_verified ?? false}
        email={user.email || ''}
      >
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Also pass it to the Header component */}
          <Header />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6">
            {children}
          </main>
        </div>
      </VerificationProvider>

      <MobileNav />
    </div>
  )
}