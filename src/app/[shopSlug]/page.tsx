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
    .select('business_name, shop_description, shop_theme')
    .eq('shop_slug', shopSlug)
    .single()

  if (!profile) return { title: 'Shop Not Found | ResellerPro' }

  const theme = profile.shop_theme || {}

  return {
    title: theme.seoTitle || `${profile.business_name} | ResellerPro Store`,
    description: theme.seoDescription || profile.shop_description || `Check out products from ${profile.business_name} on ResellerPro.`,
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
  const isDarkStore = profile?.shop_theme?.colorScheme === 'dark'

  // If not eligible, show a "Coming Soon" or "Upgrade" message for the owner,
  // or just 404 for the public if you want strict enforcement.
  // The prompt says "it only allow not free plan users only professional or above that plan users only"
  if (!isEligible) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${isDarkStore ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDarkStore ? 'bg-indigo-900/40' : 'bg-indigo-100'}`}>
          <span className={`text-2xl font-black ${isDarkStore ? 'text-indigo-300' : 'text-indigo-600'}`}>RS</span>
        </div>
        <h1 className={`text-2xl font-black ${isDarkStore ? 'text-slate-100' : 'text-slate-900'}`}>Store Coming Soon!</h1>
        <p className={`mt-2 max-w-md ${isDarkStore ? 'text-slate-400' : 'text-slate-500'}`}>
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

  let productsWithRatings = products || []

  if (productsWithRatings.length > 0) {
    const productIds = productsWithRatings.map((product: any) => product.id)

    const { data: reviewRows } = await supabase
      .from('product_reviews')
      .select('product_id, rating')
      .in('product_id', productIds)

    const ratingMap = new Map<string, { total: number; count: number }>()

    ;(reviewRows || []).forEach((review: any) => {
      const key = review.product_id
      const prev = ratingMap.get(key) || { total: 0, count: 0 }
      const next = {
        total: prev.total + Number(review.rating || 0),
        count: prev.count + 1,
      }
      ratingMap.set(key, next)
    })

    productsWithRatings = productsWithRatings.map((product: any) => {
      const stats = ratingMap.get(product.id)
      const review_count = stats?.count || 0
      const average_rating = review_count > 0
        ? Number((stats!.total / review_count).toFixed(1))
        : 0

      return {
        ...product,
        review_count,
        average_rating,
      }
    })
  }

  // Extract unique categories
  const categoriesMap = new Map()
  if (products) {
    products.forEach(p => {
      if (p.category && !categoriesMap.has(p.category)) {
        categoriesMap.set(p.category, { id: p.category, name: p.category })
      }
    })
  }
  const categories = Array.from(categoriesMap.values())

  return (
    <ShopClient
      profile={profile}
      products={productsWithRatings}
      categories={categories}
    />
  )
}
