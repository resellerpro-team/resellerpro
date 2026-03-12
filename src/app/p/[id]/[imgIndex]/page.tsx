import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PremiumProductView } from '@/components/products/PremiumProductView'

// Public, no auth required
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string; imgIndex: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, imgIndex } = await params
  const supabase = await createAdminClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description, selling_price, image_url, images')
    .eq('id', id)
    .single()

  if (!product) return { title: 'Product Not Found' }

  const allImages: string[] = (product.images && product.images.length > 0)
    ? product.images
    : product.image_url
      ? [product.image_url]
      : []

  // Pick the specific image for the WhatsApp OG preview
  const idx = Math.min(Math.max(parseInt(imgIndex, 10) || 0, 0), allImages.length - 1)
  const primaryImage = allImages[idx] || null

  const safePrice = product.selling_price ? ` for ₹${product.selling_price.toLocaleString('en-IN')}` : ''
  const descriptionText = `Check out ${product.name}${safePrice} on ResellerPro Store.`

  return {
    title: `${product.name} | ResellerPro`,
    description: descriptionText,
    openGraph: {
      title: product.name,
      description: descriptionText,
      // Canonical URL stays as the base product page
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

export default async function PublicProductImagePage({ params }: Props) {
  const { id, imgIndex } = await params
  const supabase = await createAdminClient()
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) return notFound()

  const allImages: string[] = product.images && product.images.length > 0
    ? product.images
    : product.image_url
      ? [product.image_url]
      : []

  // Clamp index
  const idx = Math.min(Math.max(parseInt(imgIndex, 10) || 0, 0), allImages.length - 1)

  let profile = null
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
  const productPageUrl = `https://www.resellerpro.in/p/${id}`

  return (
    <PremiumProductView
      product={product}
      businessName={businessName}
      businessPhone={businessPhone}
      businessLogo={businessLogo}
      productPageUrl={productPageUrl}
      allImages={allImages}
      initialActiveImage={idx}
    />
  )
}
