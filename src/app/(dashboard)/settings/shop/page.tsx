import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ShopSettingsForm from '@/components/settings/ShopSettingsForm'

export const metadata = {
  title: 'Shop Settings | ResellerPro',
  description: 'Customize your public shop page and theme.',
}

export default async function ShopSettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, shop_slug, shop_description, shop_theme, business_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return <div>Profile not found</div>
  }

  // Get subscription to check eligibility
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*, plan:subscription_plans(name, display_name)')
    .eq('user_id', user.id)
    .single()

  const planName = (Array.isArray(subscription?.plan) ? subscription.plan[0]?.name : subscription?.plan?.name)?.toLowerCase() || 'free'
  const planDisplay = (Array.isArray(subscription?.plan) ? subscription.plan[0]?.display_name : subscription?.plan?.display_name) || 'Free Plan'
  const isEligible = ['professional', 'business'].includes(planName)

  // Get product count for the preview
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Shop Settings</h3>
        <p className="text-sm text-muted-foreground">
          Control your public shop identity, appearance, and advanced customization.
        </p>
      </div>
      <ShopSettingsForm
        profile={profile}
        isEligible={isEligible}
        planName={planName}
        planDisplay={planDisplay}
        productCount={productCount || 0}
      />
    </div>
  )
}
