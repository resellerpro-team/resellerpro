import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { PremiumProductView } from '@/components/products/PremiumProductView'

// This page is public and doesn't require authentication
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const headerList = await headers()
  const host = headerList.get('host') || 'www.resellerpro.in'
  const protocol = headerList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  const baseUrl = `${protocol}://${host}`
  
  const supabase = await createAdminClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description, selling_price, image_url, images')
    .eq('id', id)
    .single()

  if (!product) return { title: 'Product Not Found' }

  // Use first image as default OG image (for base product page)
  const primaryImage = (product.images && product.images.length > 0)
    ? product.images[0]
    : product.image_url || null

  const safePrice = product.selling_price ? ` for ₹${product.selling_price.toLocaleString('en-IN')}` : ''
  const descriptionText = `Check out ${product.name}${safePrice} on ResellerPro Store.`

  return {
    title: `${product.name} | ResellerPro`,
    description: descriptionText,
    openGraph: {
      title: product.name,
      description: descriptionText,
      url: `${baseUrl}/p/${id}`,
      siteName: 'ResellerPro',
      images: primaryImage ? [
        {
          url: primaryImage,
          secureUrl: primaryImage.startsWith('https') ? primaryImage : undefined,
          width: 800,
          height: 800,
          alt: product.name,
          type: 'image/jpeg',
        }
      ] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: descriptionText,
      images: primaryImage ? [primaryImage] : [],
    }
  }
}

export default async function PublicProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createAdminClient()
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) return notFound()

  const allImages = product.images && product.images.length > 0
    ? product.images
    : product.image_url
      ? [product.image_url]
      : []

  // Fetch profile separately to avoid PGRST200 relationship errors
  let profile = null;
  if (product.user_id) {
    const { data: p } = await supabase
      .from('profiles')
      .select('business_name, phone, avatar_url')
      .eq('id', product.user_id)
      .single()
    profile = p
  }

  const businessName = profile?.business_name || 'ResellerPro Store'
  const businessPhone = profile?.phone || ''
  const businessLogo = profile?.avatar_url || ''

  // Dynamically detect base URL to support dev/prod environments correctly
  const headerList = await headers()
  const host = headerList.get('host') || 'www.resellerpro.in'
  const protocol = headerList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  const productPageUrl = `${protocol}://${host}/p/${id}`

  return (
    <PremiumProductView 
      product={product} 
      businessName={businessName} 
      businessPhone={businessPhone}
      businessLogo={businessLogo}
      productPageUrl={productPageUrl}
      allImages={allImages} 
    />
  )
}
