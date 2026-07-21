'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ShoppingCart, Zap, Minus, Plus, Star, Tag } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { trackEvent } from '@/lib/analytics'
import { StoreHeader } from '@/components/store/StoreHeader'
import { StoreProductCard } from '@/components/store/StoreProductCard'
import { StoreFooter } from '@/components/store/StoreFooter'
import type { Product, Profile, ShopTheme } from '@/types'

interface ProductDetailClientProps {
  product: Product
  relatedProducts: Product[]
  profile: Profile
  theme: ShopTheme | null
  shopSlug: string
}

export function ProductDetailClient({ product, relatedProducts, profile, theme, shopSlug }: ProductDetailClientProps) {
  const router = useRouter()
  const { addItem, openCart, setShopSlug } = useCartStore()
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [added, setAdded] = useState(false)

  const images: string[] = product.images?.length
    ? product.images
    : product.image_url
    ? [product.image_url]
    : []

  const price = product.selling_price ?? product.price ?? 0
  const compareAt = product.compare_at_price ?? null
  const savings = compareAt && compareAt > price ? compareAt - price : null
  const discountPct = savings ? Math.round((savings / compareAt!) * 100) : null
  const maxQty = product.stock_quantity > 0 ? product.stock_quantity : 99
  const isOutOfStock = product.stock_status === 'out_of_stock' || (product.track_inventory && product.stock_quantity === 0)
  const primaryColor = theme?.primaryColor || '#6366f1'
  const btnRadius = theme?.buttonStyle === 'pill' ? 'rounded-full' : theme?.buttonStyle === 'sharp' ? 'rounded-none' : 'rounded-xl'

  useEffect(() => {
    setShopSlug(shopSlug)
    trackEvent({ userId: profile.id, eventType: 'product_view', productId: product.id })
  }, [product.id, profile.id, shopSlug, setShopSlug])

  function handleAddToCart() {
    addItem({ productId: product.id, name: product.name, price, image: images[0] ?? null, quantity, stockQuantity: maxQty })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    trackEvent({ userId: profile.id, eventType: 'add_to_cart', productId: product.id })
  }

  function handleBuyNow() {
    addItem({ productId: product.id, name: product.name, price, image: images[0] ?? null, quantity, stockQuantity: maxQty })
    router.push(`/store/${shopSlug}/checkout`)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreHeader
        shopSlug={shopSlug}
        shopName={profile.shop_name || profile.business_name || 'Store'}
        logoUrl={profile.shop_logo_url || profile.avatar_url}
        announcement={profile.shop_announcement}
        theme={theme}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back */}
        <Link
          href={`/store/${shopSlug}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to store
        </Link>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm relative">
              {images.length > 0 ? (
                <Image
                  src={images[activeImage]}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">📦</div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-3xl">
                  <span className="text-white font-bold text-lg">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? 'border-current shadow-md scale-105' : 'border-slate-200 hover:border-slate-400'
                    }`}
                    style={activeImage === i ? { borderColor: primaryColor } : {}}
                    aria-label={`Image ${i + 1}`}
                  >
                    <Image src={img} alt={`Product ${i + 1}`} width={64} height={64} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.category && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3">
                <Tag className="w-3.5 h-3.5" />
                {product.category}
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            {theme?.showPrices !== false && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-black" style={{ color: primaryColor }}>
                  ₹{price.toLocaleString('en-IN')}
                </span>
                {compareAt && (
                  <span className="text-lg text-slate-400 line-through">
                    ₹{compareAt.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPct && (
                  <span className="bg-green-100 text-green-700 text-sm font-bold px-2 py-0.5 rounded-full">
                    {discountPct}% OFF
                  </span>
                )}
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-4">
              {isOutOfStock ? (
                <span className="text-sm font-bold text-red-500">❌ Out of Stock</span>
              ) : product.stock_status === 'low_stock' ? (
                <span className="text-sm font-bold text-amber-500">⚡ Only a few left!</span>
              ) : (
                <span className="text-sm font-bold text-green-600">✅ In Stock</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                {product.description}
              </p>
            )}

            {/* Quantity */}
            {!isOutOfStock && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-700 mb-2">Quantity</p>
                <div className="inline-flex items-center border rounded-xl bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
                    disabled={quantity <= 1}
                    aria-label="Decrease"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                    className="w-11 h-11 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
                    disabled={quantity >= maxQty}
                    aria-label="Increase"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 h-12 flex items-center justify-center gap-2 font-bold text-sm border-2 transition-all active:scale-95 disabled:opacity-50 ${btnRadius}`}
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <ShoppingCart className="w-4 h-4" />
                {added ? '✓ Added!' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`flex-1 h-12 flex items-center justify-center gap-2 font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-50 ${btnRadius}`}
                style={{ backgroundColor: primaryColor }}
              >
                <Zap className="w-4 h-4" />
                Buy Now
              </button>
            </div>

            {/* Trust signals */}
            <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-3 text-center">
              {[['🚚', 'Fast Delivery'], ['💵', 'COD Available'], ['🔒', 'Secure Order']].map(([emoji, label]) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span className="text-xl">{emoji}</span>
                  <span className="text-xs text-slate-500 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-black text-slate-900 mb-5">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {relatedProducts.map((p) => (
                <StoreProductCard key={p.id} product={p} storeUserId={profile.id} theme={theme ? { buttonStyle: theme.buttonStyle, showPrices: theme.showPrices } : undefined} />
              ))}
            </div>
          </div>
        )}
      </div>

      <StoreFooter profile={profile} theme={theme} />
    </div>
  )
}
