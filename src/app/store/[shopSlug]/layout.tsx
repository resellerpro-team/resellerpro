import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Profile, ShopTheme } from '@/types'

interface Props {
  params: { shopSlug: string }
  children: React.ReactNode
}

function getThemeCSSVars(theme: ShopTheme | null): string {
  const primary = theme?.primaryColor || '#6366f1'
  const accent = theme?.accentColor || '#8b5cf6'
  return `
    :root {
      --store-primary: ${primary};
      --store-accent: ${accent};
      --store-primary-10: ${primary}1a;
      --store-primary-20: ${primary}33;
    }
  `
}

export default async function StoreLayout({ params, children }: Props) {
  const { shopSlug } = params
  const supabase = await createAdminClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('shop_slug', shopSlug)
    .single()

  if (!profile) return notFound()

  // Check subscription eligibility
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*, plan:subscription_plans(name)')
    .eq('user_id', profile.id)
    .single()

  const planName = (
    Array.isArray(subscription?.plan)
      ? subscription?.plan[0]?.name
      : (subscription?.plan as { name?: string } | null)?.name
  )?.toLowerCase() ?? 'free'

  const isEligible = ['free', 'starter', 'pro', 'advanced', 'professional', 'business'].includes(planName)

  if (!isEligible) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🚀</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Store Coming Soon!</h1>
        <p className="text-slate-500 mt-2 max-w-md">
          {profile.business_name} is currently setting up their store. Please check back later.
        </p>
      </div>
    )
  }

  // Store status check
  const theme = profile.shop_theme as ShopTheme | null
  const shopStatus = theme?.storeStatus || profile.shop_status || 'open'

  if (shopStatus === 'closed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            {profile.shop_name || profile.business_name}
          </h1>
          <p className="text-slate-500">This store is currently closed. Please check back later.</p>
        </div>
      </div>
    )
  }

  if (shopStatus === 'vacation') {
    const waNum = theme?.socialWhatsApp || profile.whatsapp_number || profile.business_phone
    const waLink = waNum
      ? `https://wa.me/91${waNum.replace(/\D/g, '')}?text=Hi! I wanted to shop at your store.`
      : '#'
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🏝️</div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            {profile.shop_name || profile.business_name} is on vacation
          </h1>
          <p className="text-slate-600 mb-6">
            {theme?.vacationMessage || "We're taking a short break. We'll be back soon!"}
          </p>
          {waNum && (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all"
            >
              💬 Leave a Message
            </a>
          )}
        </div>
      </div>
    )
  }

  const cssVars = getThemeCSSVars(theme)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      {children}
    </>
  )
}
