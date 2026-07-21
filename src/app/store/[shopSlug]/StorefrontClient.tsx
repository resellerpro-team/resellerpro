'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Star, Truck, ShieldCheck, MessageCircle, ArrowRight, ChevronDown, 
  RotateCcw, Sparkles, Check, HeartHandshake, HelpCircle, ChevronLeft,
  Folder, Watch, Headphones, Shirt, Laptop, Package, Layers, Home
} from 'lucide-react'
import { StoreHeader } from '@/components/store/StoreHeader'
import { StoreProductCard } from '@/components/store/StoreProductCard'
import { StoreFooter } from '@/components/store/StoreFooter'
import { trackEvent } from '@/lib/analytics'
import { useCartStore } from '@/store/useCartStore'
import type { Product, Profile, ShopTheme } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

interface StorefrontClientProps {
  profile: Profile
  products: Product[]
  categories: string[]
  theme: ShopTheme | null
}

function getCategoryIcon(categoryName: string) {
  const name = categoryName.toLowerCase()
  if (name.includes('watch')) return <Watch className="w-5 h-5 text-slate-700" />
  if (name.includes('earbud') || name.includes('headphone') || name.includes('audio')) return <Headphones className="w-5 h-5 text-slate-700" />
  if (name.includes('clothing') || name.includes('fashion') || name.includes('wear') || name.includes('hoodie') || name.includes('shirt')) return <Shirt className="w-5 h-5 text-slate-700" />
  if (name.includes('accessory') || name.includes('bag') || name.includes('backpack')) return <Package className="w-5 h-5 text-slate-700" />
  if (name.includes('electronic') || name.includes('gadget') || name.includes('tech') || name.includes('laptop')) return <Laptop className="w-5 h-5 text-slate-700" />
  if (name.includes('home') || name.includes('living')) return <Home className="w-5 h-5 text-slate-700" />
  return <Layers className="w-5 h-5 text-slate-700" />
}

export function StorefrontClient({ profile, products, categories, theme }: StorefrontClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'new' | 'best' | 'trending'>('new')
  const setShopSlug = useCartStore((s) => s.setShopSlug)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const shopSlug = profile.shop_slug!
  const primaryColor = theme?.primaryColor || '#6366f1'

  // Set shop context in cart
  useEffect(() => {
    setShopSlug(shopSlug)
    trackEvent({ userId: profile.id, eventType: 'store_view' })
  }, [shopSlug, profile.id, setShopSlug])

  // Mock products matching the reference image exactly for default/preview state
  const mockProducts: Product[] = [
    {
      id: 'mock-1',
      user_id: profile.id,
      sku: 'PROD-001',
      name: 'Premium Chronograph Watch',
      description: 'Elegant luxury watch featuring multi-dial chronograph performance, black dial, and premium link strap.',
      price: 2799,
      selling_price: 2799,
      compare_at_price: 3499,
      image_url: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&auto=format&fit=crop',
      stock_status: 'in_stock',
      category: 'Smartwatches',
      cost_price: 1500,
      stock_quantity: 15,
      is_active: true,
      profit: 1299,
      profit_margin: 46,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-2',
      user_id: profile.id,
      sku: 'PROD-002',
      name: 'Wireless Earbuds Pro',
      description: 'Pro-tier wireless earbuds with active noise cancellation, adaptive transparency, and spatial audio.',
      price: 1899,
      selling_price: 1899,
      compare_at_price: 2299,
      image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800&auto=format&fit=crop',
      stock_status: 'in_stock',
      category: 'Earbuds',
      cost_price: 900,
      stock_quantity: 25,
      is_active: true,
      profit: 999,
      profit_margin: 52,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-3',
      user_id: profile.id,
      sku: 'PROD-003',
      name: 'Noise Canceling Headphones',
      description: 'Over-ear headphones with custom audio driver engineering, premium leather cushions, and 30-hour battery.',
      price: 3999,
      selling_price: 3999,
      compare_at_price: 4699,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
      stock_status: 'in_stock',
      category: 'Electronics',
      cost_price: 2000,
      stock_quantity: 8,
      is_active: true,
      profit: 1999,
      profit_margin: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-4',
      user_id: profile.id,
      sku: 'PROD-004',
      name: 'Travel Laptop Backpack',
      description: 'Minimalist water-resistant laptop travel bag with custom padded compartments and USB charging port.',
      price: 1599,
      selling_price: 1599,
      compare_at_price: 1999,
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop',
      stock_status: 'low_stock',
      category: 'Accessories',
      cost_price: 800,
      stock_quantity: 3,
      is_active: true,
      profit: 799,
      profit_margin: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-5',
      user_id: profile.id,
      sku: 'PROD-005',
      name: 'Premium Hoodie',
      description: 'Ultra-soft fleece hoodie featuring minimal Scandinavian fit and high-density cotton weave.',
      price: 899,
      selling_price: 899,
      compare_at_price: 999,
      image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop',
      stock_status: 'in_stock',
      category: 'Fashion',
      cost_price: 450,
      stock_quantity: 30,
      is_active: true,
      profit: 449,
      profit_margin: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  // Decide if we should render products from database or default mockup products
  const displayProducts = useMemo(() => {
    return products.length > 0 ? products : mockProducts
  }, [products])

  const displayCategories = useMemo(() => {
    if (products.length > 0) return categories
    return ['Smartwatches', 'Electronics', 'Earbuds', 'Accessories', 'Fashion']
  }, [products, categories])

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return displayProducts.filter((p) => {
      const matchCat = activeCategory ? p.category === activeCategory : true
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [displayProducts, activeCategory, searchQuery])

  const storeName = profile.shop_name || profile.business_name || 'Rashid Store'
  const waNum = theme?.socialWhatsApp || profile.whatsapp_number || profile.business_phone
  const waClean = waNum?.replace(/\D/g, '')
  const waLink = waClean ? `https://wa.me/91${waClean}?text=${encodeURIComponent('Hi! I wanted to inquire about a product.')}` : null

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Custom CSS overrides */}
      {theme?.customCss && <style dangerouslySetInnerHTML={{ __html: theme.customCss }} />}

      {/* Premium Header */}
      <StoreHeader
        shopSlug={shopSlug}
        shopName={storeName}
        shopDescription={profile.shop_description}
        logoUrl={profile.shop_logo_url || profile.avatar_url}
        announcement={profile.shop_announcement || 'Free Delivery on orders above ₹999 | COD Available'}
        theme={theme}
        onSearch={setSearchQuery}
      />

      {/* Luxury Hero Section */}
      {!searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="relative rounded-[28px] overflow-hidden bg-slate-950 text-white min-h-[460px] md:min-h-[520px] flex items-center shadow-2xl">
            {/* Visual gradient backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0" />
            <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_#ffffff_1px,_transparent_1px)] [background-size:24px_24px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-8 py-12 md:px-16 w-full">
              {/* Left Column: Headings & CTA */}
              <div className="space-y-6 text-left max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 text-slate-200 border border-white/10">
                  New Arrival
                </span>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.08] text-white">
                  Premium Quality.<br/>Timeless Style.
                </h1>
                <p className="text-sm md:text-base text-slate-400 font-semibold leading-relaxed max-w-md">
                  Discover our new collection of premium products crafted for your lifestyle. Create your own online store with ResellerPro and start selling today.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href="#products"
                    className="px-8 py-4 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Shop Collection
                  </a>
                  <a
                    href="#collections"
                    className="px-8 py-4 border border-white/20 hover:border-white/40 text-white font-black text-xs sm:text-sm rounded-xl transition-all hover:bg-white/5 active:scale-[0.98]"
                  >
                    Explore Now
                  </a>
                </div>

                {/* Micro trust icons on black background */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 border-t border-white/10 text-slate-400 text-[11px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Easy Returns</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-slate-400" />
                    <span>COD Available</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Premium Mockup Render */}
              <div className="relative w-full h-[320px] md:h-[420px] flex items-center justify-center lg:justify-end">
                <div className="relative w-[300px] h-[300px] md:w-[380px] md:h-[380px] hover:scale-105 transition-transform duration-700">
                  <Image
                    src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop"
                    alt="Premium Smartwatch Mockup"
                    fill
                    className="object-contain filter drop-shadow-[0_25px_30px_rgba(255,255,255,0.05)]"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Categories Bar */}
        {!searchQuery && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-slate-900 tracking-wider uppercase">Shop by Categories</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x">
              {/* All */}
              <button
                onClick={() => setActiveCategory(null)}
                className="snap-start shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-full border border-slate-100 hover:border-slate-200 transition-all font-bold text-xs gap-2 bg-slate-50/50 hover:bg-slate-50"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-slate-100/80 flex items-center justify-center text-slate-800 shadow-sm">
                  <Folder className="w-4 h-4 text-slate-700" />
                </div>
                <span className="text-[10px] text-slate-500 font-extrabold uppercase">All Categories</span>
              </button>

              {displayCategories.map((cat, idx) => {
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="snap-start shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-full border border-slate-100 hover:border-slate-200 transition-all font-bold text-xs gap-2 bg-slate-50/50 hover:bg-slate-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-100/80 flex items-center justify-center shadow-sm">
                      {getCategoryIcon(cat)}
                    </div>
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-tight line-clamp-1 w-full px-1">
                      {cat}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Collections Section */}
        {!searchQuery && (
          <section id="collections" className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Shop by Collections</h2>
              <a href="#products" className="text-xs font-black text-slate-500 hover:text-slate-800 flex items-center gap-1">
                <span>View all collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Collection 1: Smartwatches */}
              <div className="group relative rounded-3xl overflow-hidden bg-slate-100 min-h-[220px] p-6 flex flex-col justify-between cursor-pointer border border-slate-100 shadow-sm hover:shadow transition-shadow">
                <div className="absolute right-2 bottom-2 w-28 h-28 opacity-90 group-hover:scale-105 transition-transform duration-500">
                  <Image
                    src="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&auto=format&fit=crop"
                    alt="Smartwatches"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="space-y-1 relative z-10">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Premium Collection</span>
                  <h3 className="text-base font-black text-slate-900 leading-tight">Smartwatches</h3>
                </div>
                <span className="text-xs font-bold text-slate-800 hover:text-slate-950 flex items-center gap-1.5 pt-4 relative z-10">
                  <span>Shop now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Collection 2: Earbuds */}
              <div className="group relative rounded-3xl overflow-hidden bg-slate-100 min-h-[220px] p-6 flex flex-col justify-between cursor-pointer border border-slate-100 shadow-sm hover:shadow transition-shadow">
                <div className="absolute right-2 bottom-2 w-28 h-28 opacity-90 group-hover:scale-105 transition-transform duration-500">
                  <Image
                    src="https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&auto=format&fit=crop"
                    alt="Earbuds"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="space-y-1 relative z-10">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Clear Sound</span>
                  <h3 className="text-base font-black text-slate-900 leading-tight">Earbuds</h3>
                </div>
                <span className="text-xs font-bold text-slate-800 hover:text-slate-950 flex items-center gap-1.5 pt-4 relative z-10">
                  <span>Shop now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Collection 3: Accessories */}
              <div className="group relative rounded-3xl overflow-hidden bg-slate-100 min-h-[220px] p-6 flex flex-col justify-between cursor-pointer border border-slate-100 shadow-sm hover:shadow transition-shadow">
                <div className="absolute right-2 bottom-2 w-28 h-28 opacity-90 group-hover:scale-105 transition-transform duration-500">
                  <Image
                    src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop"
                    alt="Accessories"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="space-y-1 relative z-10">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Designed to Perfection</span>
                  <h3 className="text-base font-black text-slate-900 leading-tight">Accessories</h3>
                </div>
                <span className="text-xs font-bold text-slate-800 hover:text-slate-950 flex items-center gap-1.5 pt-4 relative z-10">
                  <span>Shop now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Collection 4: New Arrivals */}
              <div className="group relative rounded-3xl overflow-hidden bg-slate-100 min-h-[220px] p-6 flex flex-col justify-between cursor-pointer border border-slate-100 shadow-sm hover:shadow transition-shadow">
                <div className="absolute right-2 bottom-2 w-28 h-28 opacity-90 group-hover:scale-105 transition-transform duration-500">
                  <Image
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop"
                    alt="New Arrivals"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="space-y-1 relative z-10">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Check Out What's New</span>
                  <h3 className="text-base font-black text-slate-900 leading-tight">New Arrivals</h3>
                </div>
                <span className="text-xs font-bold text-slate-800 hover:text-slate-950 flex items-center gap-1.5 pt-4 relative z-10">
                  <span>Shop now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Tabbed Product Grid */}
        <section id="products" className="py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-8 gap-4">
            {/* Tabs matching reference image */}
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('new')}
                className={`pb-4 text-sm font-black uppercase tracking-wider relative transition-colors ${
                  activeTab === 'new' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                New Arrivals
                {activeTab === 'new' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-950" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('best')}
                className={`pb-4 text-sm font-black uppercase tracking-wider relative transition-colors ${
                  activeTab === 'best' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Best Sellers
                {activeTab === 'best' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-950" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={`pb-4 text-sm font-black uppercase tracking-wider relative transition-colors ${
                  activeTab === 'trending' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Trending Now
                {activeTab === 'trending' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-950" />
                )}
              </button>
            </div>

            <a href="#products" className="text-xs font-black text-slate-500 hover:text-slate-800 flex items-center gap-1">
              <span>View all products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <StoreProductCard
                key={product.id}
                product={product}
                storeUserId={profile.id}
                theme={theme ? { buttonStyle: theme.buttonStyle, showPrices: theme.showPrices } : undefined}
              />
            ))}
          </div>
        </section>

        {/* Secondary Trust Strip */}
        <section className="border-t border-slate-100 pt-14 pb-4 mt-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800 mb-3 shadow-sm">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">100% Original</h3>
              <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Authentic Products</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800 mb-3 shadow-sm">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">7 Days Returns</h3>
              <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Hassle-Free Returns</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800 mb-3 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Secure Payments</h3>
              <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">100% Safe & Secure</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800 mb-3 shadow-sm">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">24/7 Support</h3>
              <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">We're Here to Help</p>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="my-14 bg-slate-50/50 rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="space-y-3 max-w-md">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
              Testimonials
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase">Customer Reviews</h2>
            <p className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed">
              Read real feedback from verified customers who bought premium products from our store.
            </p>
          </div>
          
          <div className="flex-1 max-w-xl w-full bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <span className="text-3xl text-slate-300 font-serif leading-none">&ldquo;</span>
            <div className="space-y-4">
              <p className="text-slate-600 text-sm md:text-base italic leading-relaxed font-semibold">
                Excellent quality and fast delivery! The smartwatch I ordered exceeded my expectations.
              </p>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-black text-slate-950">— Arjun Mehta</span>
                {/* Dots indicator */}
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-900" />
                  <span className="w-2 h-2 rounded-full bg-slate-200" />
                  <span className="w-2 h-2 rounded-full bg-slate-200" />
                  <span className="w-2 h-2 rounded-full bg-slate-200" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Instagram Gallery */}
        <section className="my-14">
          <div className="text-center mb-8 space-y-1">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Follow us on Instagram</h2>
            <p className="text-xs font-bold text-slate-400 tracking-wider">@{shopSlug.replace(/-/g, '.')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-slate-100">
              <Image
                src="https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=400&fit=crop"
                alt="Instagram Item 1"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black">
                View post
              </div>
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-slate-100">
              <Image
                src="https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop"
                alt="Instagram Item 2"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black">
                View post
              </div>
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-slate-100">
              <Image
                src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop"
                alt="Instagram Item 3"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black">
                View post
              </div>
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-slate-100">
              <Image
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"
                alt="Instagram Item 4"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black">
                View post
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup Banner */}
        <section className="mt-20">
          <div className="relative rounded-[28px] overflow-hidden bg-slate-950 text-white p-8 md:p-14 flex items-center justify-between flex-col lg:flex-row gap-8 shadow-xl">
            <div className="space-y-2 text-center lg:text-left max-w-md">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Join Our Newsletter</h2>
              <p className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed">
                Get updates on new arrivals, exclusive offers, and private collections.
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="h-12 px-5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 w-full sm:w-64 transition-colors"
              />
              <button
                type="submit"
                className="h-12 px-8 bg-[#c29b68] hover:bg-[#b08856] text-white font-black text-xs uppercase rounded-xl transition-all shadow-md shrink-0 active:scale-95"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Floating WhatsApp Widget */}
      {waLink && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group">
          <div className="bg-white text-slate-900 font-black text-[11px] px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none select-none">
            Need help? Chat with us!
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-110 active:scale-95 transition-transform"
            aria-label="Chat on WhatsApp"
          >
            <svg className="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 1.977 14.07 1.01 11.455 1.01 6.02 1.01 1.62 5.377 1.617 10.806c-.001 1.69.444 3.336 1.29 4.793L1.874 21.9l6.398-1.666c-1.48.804-2.27 1.34-1.625.92z" />
            </svg>
          </a>
        </div>
      )}

      {/* Premium Footer */}
      <StoreFooter profile={profile} theme={theme} />
    </div>
  )
}
