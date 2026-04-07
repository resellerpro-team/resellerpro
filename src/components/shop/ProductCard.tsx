'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Star, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: any
  theme?: any
  layout?: string
}

export function ProductCard({ product, theme, layout = 'grid' }: ProductCardProps) {
  const primaryColor = theme?.primaryColor || '#4f46e5'
  const showPrices = theme?.showPrices !== false
  const showBuyButton = theme?.showWhatsApp !== false
  const buttonStyle = theme?.buttonStyle || 'rounded'
  const shadowLevel = theme?.shadow || 'default' // 'none', 'sm', 'default', 'lg', 'xl'

  const btnClass = buttonStyle === 'pill' ? 'rounded-full' : buttonStyle === 'sharp' ? 'rounded-none' : 'rounded-2xl'
  
  const shadowClasses: Record<string, string> = {
    'none': '',
    'sm': 'shadow-sm',
    'default': 'shadow-md border border-slate-200/60',
    'lg': 'shadow-lg border border-slate-100',
    'xl': 'shadow-xl shadow-slate-200/50 border border-slate-100/50',
  }
  const shadowClass = shadowClasses[shadowLevel as string] || shadowClasses['default']

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0)
  }

  const sellingPrice = product.selling_price || 0
  const originalPrice = product.original_price || sellingPrice * 1.25 // Fake original price if not provided for demo aesthetic
  const hasDiscount = originalPrice > sellingPrice
  const discountPercent = hasDiscount ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0
  const reviewCount = Number(product.review_count || 0)
  const averageRating = Number(product.average_rating || 0)
  const formattedRating = averageRating > 0 ? averageRating.toFixed(1) : '0.0'
  const ratingLabel = reviewCount > 0 ? formattedRating : 'New'

  // ── LIST LAYOUT ──
  if (layout === 'list') {
    return (
      <div className={cn("group bg-white rounded-[1.5rem] overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 hover:border-slate-200 transition-all duration-500 flex items-center gap-4 p-3 md:p-4", shadowClass)}>
        <Link href={`/p/${product.id}`} className="relative w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ShoppingBag className="w-8 h-8" />
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-black tracking-widest uppercase rounded-lg shadow-sm">
              {discountPercent}% OFF
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1 h-full">
          <div>
            <div className="flex items-center justify-between mb-1">
              {product.category ? (
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {product.category}
                </span>
              ) : <span className="h-3" />}
              <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {ratingLabel}
                {reviewCount > 0 && <span className="text-slate-400">({reviewCount})</span>}
              </div>
            </div>
            <Link href={`/p/${product.id}`}>
              <h3 className="font-bold text-base md:text-lg text-slate-900 group-hover:text-indigo-600 transition-colors truncate tracking-tight">{product.name}</h3>
            </Link>
            {product.description && (
              <p className="text-[11px] md:text-xs text-slate-500 mt-1 line-clamp-2 md:line-clamp-2 leading-relaxed font-medium">{product.description}</p>
            )}
          </div>
          
          <div className="flex items-end justify-between mt-4">
            {showPrices && (
               <div className="flex items-end gap-2 flex-wrap">
                 <span className="text-lg md:text-2xl font-black text-slate-900 tracking-tight leading-none">{formatPrice(sellingPrice)}</span>
                 {hasDiscount && (
                   <span className="text-[11px] md:text-xs text-slate-400 line-through font-medium pb-0.5">{formatPrice(originalPrice)}</span>
                 )}
               </div>
            )}
            {showBuyButton && (
              <Link href={`/p/${product.id}`} className="shrink-0 ml-4 relative z-10 block">
                <div className={cn("flex items-center justify-center gap-2 font-bold h-10 md:h-11 px-5 shadow-sm hover:shadow-[0_8px_20px_rgb(0,0,0,0.12)] transition-all duration-300 active:scale-95 text-white hover:-translate-y-0.5", btnClass)}
                  style={{ backgroundColor: primaryColor }}>
                  <ShoppingBag className="w-4 h-4 md:w-[18px] md:h-[18px]" /> 
                  <span className="hidden md:inline tracking-wide text-xs uppercase">Buy Now</span>
                  <span className="md:hidden text-xs uppercase tracking-wide">Buy</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── COMPACT LAYOUT ──
  if (layout === 'compact') {
    return (
      <div className={cn("group bg-white rounded-2xl overflow-hidden hover:shadow-[0_8px_25px_rgb(0,0,0,0.06)] border border-slate-100 transition-all duration-300 flex flex-col h-full", shadowClass)}>
        <Link href={`/p/${product.id}`} className="relative aspect-square overflow-hidden bg-slate-50 border-b border-slate-50">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ShoppingBag className="w-8 h-8" />
            </div>
          )}
          {hasDiscount && (
            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-red-500/90 backdrop-blur-sm text-white text-[9px] font-black rounded-lg shadow-sm">
              -{discountPercent}%
            </div>
          )}
           <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>
        <div className="p-3 flex flex-col flex-1">
          <Link href={`/p/${product.id}`} className="flex-1">
             <h3 className="text-[13px] font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug tracking-tight">{product.name}</h3>
          </Link>
          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-slate-500">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{ratingLabel}</span>
            {reviewCount > 0 && <span className="text-slate-400">({reviewCount})</span>}
          </div>
          {showPrices && (
            <div className="mt-2 flex flex-col">
              {hasDiscount && (
                <span className="text-[10px] text-slate-400 line-through shrink-0 mb-0.5">{formatPrice(originalPrice)}</span>
              )}
              <span className="text-[15px] font-black text-slate-900 leading-none">{formatPrice(sellingPrice)}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── GRID LAYOUT (default) ──
  return (
    <div className={cn("group relative bg-white rounded-[1.5rem] overflow-hidden hover:shadow-[0_12px_30px_rgb(0,0,0,0.08)] border border-slate-200/60 hover:border-slate-200 transition-all duration-500 flex flex-col h-full", shadowClass)}>
      
      {/* Image Block */}
      <Link href={`/p/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-slate-50 flex-shrink-0 z-0 border-b border-transparent">
        {product.image_url ? (
           <Image src={product.image_url} alt={product.name} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
            <ShoppingBag className="w-12 h-12" />
          </div>
        )}

        {/* Elegant Top Badging */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10 pointer-events-none">
          {hasDiscount ? (
            <div className="bg-red-500/90 backdrop-blur-md text-white border border-red-400/50 shadow-sm text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg">
               {discountPercent}% OFF
            </div>
          ) : <div/>}

          {hasDiscount && discountPercent > 20 && (
            <div className="bg-white/90 backdrop-blur-md text-slate-800 border border-white shadow-sm text-[9px] font-black uppercase px-2 py-1 rounded-lg flex items-center gap-1.5">
               <TrendingUp className="w-3 h-3 text-orange-500" /> HOT
            </div>
          )}
        </div>
        
        {/* Subtle Hover Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Link>

      {/* Content Block */}
      <div className="p-4 md:p-5 flex flex-col flex-1 relative bg-white z-20">
        <div className="flex-1">
          {/* Meta & Rating Row */}
          <div className="flex items-center justify-between mb-2">
            {product.category ? (
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                {product.category}
              </span>
            ) : <span className="h-4" />}
             
             <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100 group-hover:border-slate-200 transition-colors">
               <Star className="w-[10px] h-[10px] text-amber-400 fill-amber-400" /> {ratingLabel}
               {reviewCount > 0 && <span className="text-slate-400">({reviewCount})</span>}
             </div>
          </div>

          <Link href={`/p/${product.id}`}>
            <h3 className="text-base md:text-[17px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug tracking-tight">
              {product.name}
            </h3>
          </Link>

          {showPrices && (
            <div className="mt-3 flex items-end gap-2 flex-wrap">
              <span className="text-xl md:text-[22px] font-black text-slate-900 tracking-tight leading-none">{formatPrice(sellingPrice)}</span>
              {hasDiscount && (
                <span className="text-xs md:text-[13px] text-slate-400 line-through font-medium pb-0.5">{formatPrice(originalPrice)}</span>
              )}
            </div>
          )}
        </div>

        {/* CTA Block */}
        {showBuyButton && (
          <div className="mt-5 pt-4 border-t border-slate-100/80">
            <Link href={`/p/${product.id}`} className="block w-full">
              <div
                className={cn(
                  "w-full flex items-center justify-center gap-2 font-black h-[46px] text-xs transition-all duration-300 text-white shadow-sm hover:shadow-[0_8px_20px_rgb(0,0,0,0.15)] hover:-translate-y-0.5 active:scale-95 group/btn overflow-hidden relative", 
                  btnClass
                )}
                style={{ backgroundColor: primaryColor }}
              >
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                <ShoppingBag className="w-4 h-4 md:w-[18px] md:h-[18px] transition-transform group-hover/btn:scale-110 group-hover/btn:-rotate-6" />
                <span className="uppercase tracking-widest relative top-[1px]">Buy Now</span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
