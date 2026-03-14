import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { ShopClient } from '@/components/shop/ShopClient'
import { Metadata } from 'next'

interface Props {
  params: { shopSlug: string }
}

const RESERVED_SLUGS = [
  'admin', 'api', 'auth', 'dashboard', 'settings', 'p', 'pricing', 
  'about', 'contact', 'features', 'privacy-policy', 'terms-and-conditions',
  'ekodrix-panel', 'login', 'signup', 'actions'
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shopSlug } = params
  
  if (RESERVED_SLUGS.includes(shopSlug)) return { title: 'ResellerPro' }

  const supabase = await createAdminClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_name, shop_description')
    .eq('shop_slug', shopSlug)
    .single()

  if (!profile) return { title: 'Shop Not Found | ResellerPro' }

  return {
    title: `${profile.business_name} | ResellerPro Store`,
    description: profile.shop_description || `Check out products from ${profile.business_name} on ResellerPro.`,
  }
}

export default async function ShopPage({ params }: Props) {
  const { shopSlug } = params

  // If it's a reserved route, we shouldn't have matched here if Next.js routing worked perfectly,
  // but catch-all can be greedy. In App Router, defined routes take precedence.
  if (RESERVED_SLUGS.includes(shopSlug)) return notFound()

  const supabase = await createAdminClient()

  // 1. Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('shop_slug', shopSlug)
    .single()

  if (profileError || !profile) return notFound()

  // 2. Verify Plan (Professional or Business required for LIVE shop)
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*, plan:subscription_plans(name)')
    .eq('user_id', profile.id)
    .single()

  const planName = (Array.isArray(subscription?.plan) ? subscription.plan[0]?.name : subscription?.plan?.name)?.toLowerCase() || 'free'
  const isEligible = ['professional', 'business'].includes(planName)

  // If not eligible, show a "Coming Soon" or "Upgrade" message for the owner, 
  // or just 404 for the public if you want strict enforcement.
  // The prompt says "it only allow not free plpan users only professional or above that plan users only"
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

  // 3. Fetch Products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  const initialProducts = products || []
  const categories = Array.from(new Set(initialProducts.map(p => p.category).filter(Boolean))) as string[]
  const maxPrice = Math.max(...initialProducts.map(p => p.selling_price), 1000)

  return (
    <ShopClient 
      initialProducts={initialProducts}
      categories={categories}
      maxPrice={maxPrice}
      profile={profile}
    />
  )
}
