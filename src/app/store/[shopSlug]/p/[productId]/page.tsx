import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProductDetailClient } from './ProductDetailClient'
import type { Product, ShopTheme } from '@/types'

interface Props {
  params: { shopSlug: string; productId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createAdminClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url')
    .eq('id', params.productId)
    .single()

  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: product.description || product.name,
    openGraph: {
      images: product.image_url ? [product.image_url] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { shopSlug, productId } = params
  const supabase = await createAdminClient()

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('shop_slug', shopSlug)
    .single()

  if (!profile) return notFound()

  // Get product
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('user_id', profile.id)
    .single()

  if (!product) return notFound()

  // Get related products (same category, exclude current)
  const { data: related } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', profile.id)
    .eq('category', product.category || '')
    .neq('id', productId)
    .limit(4)

  const theme = profile.shop_theme as ShopTheme | null

  const enriched: Product = { ...product, price: product.selling_price }
  const relatedEnriched: Product[] = (related || []).map((p) => ({ ...p, price: p.selling_price }))

  return (
    <ProductDetailClient
      product={enriched}
      relatedProducts={relatedEnriched}
      profile={profile}
      theme={theme}
      shopSlug={shopSlug}
    />
  )
}
