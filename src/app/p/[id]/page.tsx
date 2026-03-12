import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PremiumProductView } from '@/components/products/PremiumProductView'

// This page is public and doesn't require authentication
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ img?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params
  const { img } = await searchParams
  const supabase = await createAdminClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description, selling_price, image_url, images')
    .eq('id', id)
    .single()

  if (!product) return { title: 'Product Not Found' }

  // Build image list same way as the client side
  const allImages: string[] = (product.images && product.images.length > 0)
    ? product.images
    : product.image_url
      ? [product.image_url]
      : []

  // Use ?img=N query param to select the image for OG (used by WhatsApp link preview)
  const imgIndex = img !== undefined ? Math.min(Math.max(parseInt(img, 10) || 0, 0), allImages.length - 1) : 0
  const primaryImage = allImages[imgIndex] || null
  
  // Sanitize the description text heavily to prevent WhatsApp crawler from choking on broken emojis
  const safePrice = product.selling_price ? ` for ₹${product.selling_price.toLocaleString('en-IN')}` : ''
  const descriptionText = `Check out ${product.name}${safePrice} on ResellerPro Store.`

  return {
    title: `${product.name} | ResellerPro`,
    description: descriptionText,
    openGraph: {
      title: product.name,
      description: descriptionText,
      url: `https://www.resellerpro.in/p/${id}`,
      siteName: 'ResellerPro',
      images: primaryImage ? [
        {
          url: primaryImage,
          width: 800,
          height: 800,
          alt: product.name,
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

  // We pass phone + productId to the client so it can build the waLink dynamically
  // based on whichever image the user is currently viewing.
  const productPageUrl = `https://www.resellerpro.in/p/${id}`

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
