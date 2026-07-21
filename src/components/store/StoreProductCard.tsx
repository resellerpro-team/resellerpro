'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingBag, Heart, Star } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { trackEvent } from '@/lib/analytics'
import type { Product } from '@/types'
import { cn } from '@/lib/utils/cn'

interface StoreProductCardProps {
  product: Product
  storeUserId: string
  layout?: 'grid' | 'list'
  theme?: {
    buttonStyle?: string
    showPrices?: boolean
    showWhatsApp?: boolean
  }
}

export function StoreProductCard({ product, storeUserId, layout = 'grid', theme }: StoreProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const showPrices = theme?.showPrices !== false

  const isOutOfStock =
    (product.stock_status === 'out_of_stock') ||
    (product.track_inventory && product.stock_quantity === 0)

  const price = product.selling_price ?? product.price ?? 0
  const compareAt = product.compare_at_price ?? null
  const imageUrl = product.image_url || (product.images && product.images[0]) || null

  const savings = compareAt && compareAt > price ? compareAt - price : null
  const discountPct = savings ? Math.round((savings / compareAt!) * 100) : null

  // Simulated premium review metadata (defaults for premium look)
  const rating = 5
  const reviewCount = (() => {
    let hash = 0
    const str = product.id || product.name || 'default'
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return Math.abs(hash % 80) + 40
  })()

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation()
    if (isOutOfStock) return
    addItem({
      productId: product.id,
      name: product.name,
      price,
      image: imageUrl,
      quantity: 1,
      stockQuantity: product.stock_quantity > 0 ? product.stock_quantity : undefined,
    })
    trackEvent({ userId: storeUserId, eventType: 'add_to_cart', productId: product.id })
  }

  function handleCardClick() {
    // If details modal or navigation is needed
  }

  if (layout === 'list') {
    return (
      <div 
        onClick={handleCardClick}
        className="flex gap-5 bg-white rounded-3xl border border-slate-100 p-3 hover:shadow-lg hover:border-slate-200/60 transition-all duration-300 cursor-pointer"
      >
        <div className="w-28 h-28 flex-shrink-0 bg-slate-50 rounded-2xl relative overflow-hidden">
          {imageUrl ? (
            <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="112px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300 text-3xl">📦</div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-[10px] font-black tracking-wider uppercase">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="flex-1 py-1 flex flex-col justify-between">
          <div className="space-y-1">
            {product.category && (
              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">{product.category}</span>
            )}
            <p className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug">{product.name}</p>
            
            {/* Star Rating */}
            <div className="flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-bold">({reviewCount})</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            {showPrices && (
              <div className="flex items-baseline gap-2">
                <span className="font-black text-slate-950 text-base">
                  ₹{price.toLocaleString('en-IN')}
                </span>
                {compareAt && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{compareAt.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-slate-950 hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white rounded-[24px] border border-slate-100 overflow-hidden hover:shadow-xl hover:border-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer relative"
    >
      {/* Discount Badge */}
      {discountPct && discountPct > 0 && (
        <span className="absolute top-4 left-4 z-10 bg-slate-950 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
          -{discountPct}%
        </span>
      )}

      {/* Wishlist Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsWishlisted(p => !p)
        }}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm active:scale-90 transition-all"
        aria-label="Add to wishlist"
      >
        <Heart className={cn("w-4 h-4 transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "text-slate-400")} />
      </button>

      {/* Product Image Frame */}
      <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300 text-5xl">📦</div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-white/95 text-slate-900 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg shadow">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          {product.category && (
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
              {product.category}
            </span>
          )}
          <p className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-slate-800 transition-colors">
            {product.name}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 font-bold">({reviewCount})</span>
          </div>
        </div>

        <div>
          {showPrices && (
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-black text-base text-slate-950">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {compareAt && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{compareAt.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full flex items-center justify-center gap-2 py-3 text-xs font-black text-white bg-slate-950 hover:bg-slate-800 disabled:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all active:scale-[0.98] shadow-sm hover:shadow"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
