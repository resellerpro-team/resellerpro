'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: any
  businessPhone: string
  businessName: string
  theme?: any
  layout?: string
}

export function ProductCard({ product, businessPhone, businessName, theme, layout = 'grid' }: ProductCardProps) {
  const primaryColor = theme?.primaryColor || '#4f46e5'
  const showPrices = theme?.showPrices !== false
  const showWhatsApp = theme?.showWhatsApp !== false
  const buttonStyle = theme?.buttonStyle || 'rounded'

  const btnClass = buttonStyle === 'pill' ? 'rounded-full' : buttonStyle === 'sharp' ? 'rounded-none' : 'rounded-xl'

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const waMessage = `Hi ${businessName}, I want to buy "${product.name}"${showPrices ? ` (Price: ${formatPrice(product.selling_price)})` : ''}. Is it available?\n\nhttps://resellerpro.in/p/${product.id}`
  const cleanPhone = businessPhone ? businessPhone.replace(/[^\d]/g, '') : ''
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`

  // ── LIST LAYOUT ──
  if (layout === 'list') {
    return (
      <div className="group bg-white rounded-xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 flex items-center gap-4 p-3">
        <Link href={`/p/${product.id}`} className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ShoppingBag className="w-8 h-8" />
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/p/${product.id}`}>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{product.name}</h3>
          </Link>
          {product.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{product.description}</p>
          )}
          {showPrices && (
            <span className="text-lg font-black text-slate-900 mt-1 inline-block">{formatPrice(product.selling_price)}</span>
          )}
        </div>
        {showWhatsApp && (
          <Link href={waLink} target="_blank" className="shrink-0">
            <Button className={cn("gap-2 font-bold h-10 transition-all active:scale-95", btnClass)}
              style={{ backgroundColor: primaryColor }}>
              <ShoppingBag className="w-4 h-4" /> Buy
            </Button>
          </Link>
        )}
      </div>
    )
  }

  // ── COMPACT LAYOUT ──
  if (layout === 'compact') {
    return (
      <div className="group bg-white rounded-xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
        <Link href={`/p/${product.id}`} className="relative aspect-square overflow-hidden bg-slate-100">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ShoppingBag className="w-8 h-8" />
            </div>
          )}
        </Link>
        <div className="p-2.5">
          <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{product.name}</h3>
          {showPrices && (
            <span className="text-sm font-black text-slate-900">{formatPrice(product.selling_price)}</span>
          )}
        </div>
      </div>
    )
  }

  // ── GRID LAYOUT (default) ──
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-full">
      <Link href={`/p/${product.id}`} className="relative aspect-square overflow-hidden bg-slate-100 flex-shrink-0">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ShoppingBag className="w-12 h-12" />
          </div>
        )}

        {product.category && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 backdrop-blur-md text-slate-700 hover:bg-white border-0 shadow-sm text-[10px] font-bold uppercase tracking-wider">
              {product.category}
            </Badge>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <Link href={`/p/${product.id}`}>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          {showPrices && (
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">{formatPrice(product.selling_price)}</span>
            </div>
          )}
          {product.description && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {showWhatsApp && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
            <Link href={waLink} target="_blank" className="flex-1">
              <Button
                className={cn("w-full gap-2 font-bold h-10 transition-all active:scale-95", btnClass)}
                style={{ backgroundColor: primaryColor }}
              >
                <ShoppingBag className="w-4 h-4" />
                Buy Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
