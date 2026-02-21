import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingBag, MessageCircle, Share2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

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
    .select('name, description, image_url')
    .eq('id', id)
    .single()

  if (!product) return { title: 'Product Not Found' }

  return {
    title: `${product.name} | ResellerPro`,
    description: product.description || `Check out ${product.name} on ResellerPro`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
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
      .select('business_name, phone')
      .eq('id', product.user_id)
      .single()
    profile = p
  }

  const businessName = profile?.business_name || 'ResellerPro Store'
  const businessPhone = profile?.phone || ''

  // Format WhatsApp Link
  const waMessage = encodeURIComponent(`Hi ${businessName}, I'm interested in "${product.name}" (Price: ₹${product.selling_price.toLocaleString()}). Is it available?`)
  const waLink = businessPhone 
    ? `https://wa.me/${businessPhone.replace(/[^\d]/g, '')}?text=${waMessage}`
    : `https://wa.me/?text=${waMessage}`

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pb-20">
      {/* Dynamic Header */}
      <div className="w-full bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800">{businessName}</span>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
           <Share2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="w-full max-w-lg bg-white shadow-2xl overflow-hidden sm:rounded-3xl sm:my-8">
        {/* Main Image Container */}
        <div className="relative aspect-[4/5] bg-slate-100 group">
          {allImages.length > 0 ? (
            <Image
              src={allImages[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-20 h-20 text-slate-200" />
            </div>
          )}

          {/* Price Tag Overlay */}
          <div className="absolute bottom-6 right-6">
            <div className="bg-white/95 backdrop-blur shadow-2xl rounded-2xl px-5 py-3 border border-indigo-100 flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Price</span>
              <span className="text-2xl font-black text-indigo-600 leading-tight">₹{product.selling_price.toLocaleString()}</span>
            </div>
          </div>

          {/* Stock Status Badge */}
          <div className="absolute top-6 left-6">
             <Badge className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border-0 ${
               product.stock_status === 'in_stock' ? 'bg-emerald-500' : 
               product.stock_status === 'low_stock' ? 'bg-amber-500' : 'bg-rose-500'
             }`}>
               {product.stock_status.replace('_', ' ').toUpperCase()}
             </Badge>
          </div>
        </div>

        {/* Product Details Content */}
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>
            {product.category && (
              <p className="text-sm font-semibold text-indigo-500 uppercase tracking-widest">
                {product.category}
              </p>
            )}
          </div>

          <div className="h-px bg-slate-100" />

          {product.description && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Description</h2>
              <p className="text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <div className="pt-4 grid grid-cols-2 gap-4">
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">SKU</p>
                <p className="font-mono text-xs font-bold text-slate-700">{product.sku || 'N/A'}</p>
             </div>
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                <p className="text-xs font-bold text-slate-700">{product.stock_status.replace('_', ' ')}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Floating CTA for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent z-50">
        <div className="max-w-lg mx-auto flex gap-4">
          <Button asChild size="lg" className="flex-1 rounded-2xl h-14 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95 group">
            <Link href={waLink} target="_blank">
               <span className="flex items-center gap-2">
                 <MessageCircle className="w-5 h-5 group-hover:animate-bounce" />
                 <span className="font-bold">Chat to Order</span>
               </span>
               <ArrowRight className="w-4 h-4 ml-2 opacity-50" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 shadow-lg text-slate-600">
            <ShoppingBag className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Brand Footer */}
      <div className="mt-8 text-center space-y-2 opacity-40 grayscale">
         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Powered By</p>
         <p className="text-lg font-black tracking-tighter text-indigo-900">ResellerPro</p>
      </div>
    </div>
  )
}
