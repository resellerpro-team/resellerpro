import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PremiumProductView } from '@/components/products/PremiumProductView'

// This page is public and doesn't require authentication
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createAdminClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url, images')
    .eq('id', id)
    .single()

  if (!product) return { title: 'Product Not Found' }

  // Use first array image if exists, fallback to legacy image_url
  const primaryImage = (product.images && product.images.length > 0) ? product.images[0] : product.image_url
  
  // WhatsApp crawler safely respects truncated descriptions (avoids throwing away metadata if text is too huge)
  const descriptionText = (product.description || `Check out ${product.name} on ResellerPro`).slice(0, 200)

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

  // Format WhatsApp Link
  const waMessage = encodeURIComponent(`Hi ${businessName}, I'm interested in "${product.name}" (Price: ₹${product.selling_price.toLocaleString()}). Is it available?`)
  const waLink = businessPhone 
    ? `https://wa.me/${businessPhone.replace(/[^\d]/g, '')}?text=${waMessage}`
    : `https://wa.me/?text=${waMessage}`

  return (
    <PremiumProductView 
      product={product} 
      businessName={businessName} 
      businessLogo={businessLogo}
      waLink={waLink} 
      allImages={allImages} 
    />
  )
}
