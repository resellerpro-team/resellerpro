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
  businessName?: string | null;
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

  // Fetch profile and subscription initialization
  const profileResult = await supabase
    .from('profiles')
    .select('full_name, avatar_url, business_name, email_verified')
    .eq('id', user.id)
    .single()

  const { checkAndDowngradeSubscription } = await import('@/lib/subscription-utils')
  let subscription = await checkAndDowngradeSubscription(user.id)
  let profile = profileResult.data

  // SELF-HEALING: If profile or subscription is missing, ensure base initialization
  if ((!profile || !subscription) && user) {
    try {
      console.log('Self-healing initialization for user:', user.id)

      // 1. Ensure Profile exists (using upsert to avoid duplicate errors)
      if (!profile) {
        const { data: newProfile, error: pError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name || 'User',
            email_verified: false,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
          .select()
          .single()

        if (!pError) profile = newProfile
      }

      // 2. Ensure Default Subscription exists if missing
      // (This prevents dashboard crashes if DB triggers failed or didn't run yet)
      if (!subscription) {
        const { data: freePlan } = await supabase
          .from('subscription_plans')
          .select('id, display_name')
          .eq('name', 'free')
          .single()

        if (freePlan) {
          const { data: newSub, error: sError } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: user.id,
              plan_id: freePlan.id,
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString() // 10 years
            }, { onConflict: 'user_id' }) // Handle conflict gracefully
            .select('plan:subscription_plans(display_name)')
            .single()

          if (!sError) subscription = newSub
        }
      }
    } catch (upsertError) {
      console.error('Self-healing failed (non-critical):', upsertError)
    }
  }

  // Prepare the user data object to pass to client components
  const userData: UserData = {
    name: profile?.full_name,
    email: user.email,
    avatarUrl: profile?.avatar_url,
    businessName: profile?.business_name,
    planName: (Array.isArray(subscription?.plan)
      ? (subscription?.plan as any)[0]?.display_name
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