'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Copy, ExternalLink, MessageCircle, CheckCircle2, Store, ChevronRight, Settings } from 'lucide-react'

interface ShopProfile {
  shop_slug: string | null
  shop_name: string | null
  business_name: string | null
  whatsapp_number: string | null
  onboarding_completed: boolean | null
}

interface StoreLiveBannerProps {
  shopProfile: ShopProfile | null
}

export function StoreLiveBanner({ shopProfile }: StoreLiveBannerProps) {
  const [copied, setCopied] = useState(false)

  if (!shopProfile) return null

  const { shop_slug, shop_name, business_name, whatsapp_number, onboarding_completed } = shopProfile
  const storeName = shop_name || business_name || 'Your Store'

  // If no slug set yet — show setup prompt
  if (!shop_slug) {
    return (
      <div className="rounded-2xl border border-dashed border-orange-300 bg-orange-50 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
          <Store className="w-5 h-5 text-orange-600" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-orange-900 text-sm">Your store is not set up yet</p>
          <p className="text-orange-700 text-xs mt-0.5">Set up your online store to start receiving orders 24/7</p>
        </div>
        <Link
          href="/settings/shop"
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors"
        >
          <Settings className="w-4 h-4" />
          Setup Store
        </Link>
      </div>
    )
  }

  const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://resellerpro.in'}/store/${shop_slug}`

  function handleCopy() {
    navigator.clipboard.writeText(storeUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleShare() {
    const waNum = whatsapp_number?.replace(/\D/g, '') || ''
    const message = `🎉 My online store is now LIVE!\n\nShop here 👉 ${storeUrl}\n\n✅ Easy checkout  ✅ COD available  ✅ Fast delivery\n\n#${storeName}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Status Indicator */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-60" />
          </div>
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
            <Store className="w-5 h-5 text-green-700" />
          </div>
        </div>

        {/* URL and Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold text-green-900 text-sm">🟢 Your Store is LIVE</p>
          </div>
          <p className="text-green-700 text-xs font-mono truncate">{storeUrl}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-white hover:bg-green-100 text-green-700 border border-green-200'
            }`}
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-green-500 hover:bg-green-600 text-white transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Share
          </button>

          <Link
            href={storeUrl}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Store
          </Link>
        </div>
      </div>
    </div>
  )
}
