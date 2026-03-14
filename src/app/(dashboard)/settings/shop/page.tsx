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
    .select('id, shop_slug, shop_description, shop_theme, business_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return <div>Profile not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Shop Settings</h3>
        <p className="text-sm text-muted-foreground">
          Control your public shop identity and appearance.
        </p>
      </div>
      <ShopSettingsForm profile={profile} />
    </div>
  )
}
