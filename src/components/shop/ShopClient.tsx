'use client'

import React, { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ShopHeader } from './ShopHeader'
import { ProductGrid } from './ProductGrid'
import { FilterBar, SortOption } from './FilterBar'
import { HeroSlider } from './HeroSlider'
import { ExternalLink, HelpCircle, Inbox, Tag, Star, MapPin, Mail, Phone, MessageCircle, Shield, Truck, RotateCcw, HeartHandshake, Check, Youtube, Facebook, Instagram, Twitter } from 'lucide-react'
import Image from 'next/image'

interface ShopClientProps {
  profile: any
  products: any[]
  categories: any[]
}

const DEFAULT_BANNER = {
  id: 'd1',
  image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80',
  title: 'Discover Premium Quality',
  subtitle: 'Elevate your lifestyle with our exclusive collection.',
  ctaText: 'Shop Collection'
}

export function ShopClient({ profile, products, categories }: ShopClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('newest')
  
  const theme = profile.shop_theme || {}

  // Basic styling
  const primaryColor = theme.primaryColor || '#4f46e5'
  const colorScheme = theme.colorScheme || 'light'
  
  // Advanced Features
  const heroEnabled = theme.heroEnabled || false
  const storeStatus = theme.storeStatus || 'open'
  const testimonialsEnabled = theme.testimonialsEnabled || false
  const trustBadgesEnabled = theme.trustBadgesEnabled || false
  const categoryShowcase = theme.categoryShowcase !== false
  const chatWidgetEnabled = theme.chatWidgetEnabled !== false

  // Establish max price
  const maxPrice = useMemo(() => {
    if (!products || products.length === 0) return 10000
    return Math.max(...products.map(p => p.selling_price || 0))
  }, [products])

  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice])

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesCategory = activeCategory !== 'all' ? p.category === activeCategory : true
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      const pPrice = p.selling_price || 0
      const matchesPrice = pPrice >= priceRange[0] && pPrice <= priceRange[1]

      return matchesCategory && matchesSearch && matchesPrice
    })

    // Sort
    result.sort((a, b) => {
      const pa = a.selling_price || 0
      const pb = b.selling_price || 0
      if (sortOption === 'price_low') return pa - pb
      if (sortOption === 'price_high') return pb - pa
      // default newest (assuming higher id or created_at logic, using simple fallback here)
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    })

    return result
  }, [products, activeCategory, searchQuery, priceRange, sortOption])

  // Store Status Screens
  if (storeStatus === 'closed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">{profile.business_name}</h1>
          <p className="text-slate-500">This store is currently closed. Please check back later.</p>
        </div>
      </div>
    )
  }

  if (storeStatus === 'vacation') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-4xl">🏝️</div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">{profile.business_name} is on vacation</h1>
          <p className="text-slate-600 mb-6">{theme.vacationMessage || "We're taking a short break. We'll be back soon!"}</p>
          <a href={theme.socialWhatsApp ? `https://wa.me/${theme.socialWhatsApp.replace(/[^\d]/g, '')}` : `https://wa.me/${profile.business_phone?.replace(/[^\d]/g, '')}`} 
            target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-amber-500/25">
            <MessageCircle className="w-5 h-5" /> Leave a Message
          </a>
        </div>
      </div>
    )
  }

  const trustBadgeIcons: Record<string, { icon: any, label: string }> = {
    'secure_payment': { icon: Shield, label: 'Secure Payment' },
    'fast_delivery': { icon: Truck, label: 'Fast Delivery' },
    'easy_returns': { icon: RotateCcw, label: 'Easy Returns' },
    'quality': { icon: Star, label: 'Quality Assured' },
    'support': { icon: HeartHandshake, label: '24/7 Support' },
    'authentic': { icon: Check, label: '100% Authentic' },
  }

  const categoryNames = categories.map(c => c.name)

  return (
    <div className={`min-h-screen bg-slate-50 relative ${colorScheme === 'dark' ? 'dark bg-slate-950' : ''}`}>
      {theme.customCss && <style dangerouslySetInnerHTML={{ __html: theme.customCss }} />}

      <ShopHeader 
        businessName={profile.business_name}
        businessLogo={profile.avatar_url}
        description={profile.shop_description}
        theme={theme}
        onSearch={setSearchQuery}
        initialSearch={searchQuery}
      />

      <main className="pb-24">
        {/* Dynamic Hero Slider */}
        {heroEnabled && !searchQuery && (
          <HeroSlider 
            banners={theme.bannerImages && theme.bannerImages.length > 0 ? theme.bannerImages : [{...DEFAULT_BANNER, title: theme.heroTitle || DEFAULT_BANNER.title}]} 
            primaryColor={primaryColor} 
          />
        )}

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16" id="products">
          <div className="flex flex-col lg:flex-row gap-8 items-stretch relative">
            
            {/* Desktop Filter Sidebar */}
            <div className="hidden lg:block w-[300px] shrink-0 relative">
              <FilterBar 
                categories={categoryNames}
                selectedCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                maxPrice={maxPrice}
                totalProducts={products.length}
                filteredCount={filteredProducts.length}
                sortOption={sortOption}
                onSortChange={setSortOption}
                primaryColor={primaryColor}
                isMobile={false}
              />
            </div>

            {/* Mobile Filter Sheet & Main Content */}
            <div className="flex-1 w-full min-w-0">
               {/* Mobile Filter Trigger */}
              <div className="lg:hidden mb-8">
                <FilterBar 
                  categories={categoryNames}
                  selectedCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  priceRange={priceRange}
                  onPriceChange={setPriceRange}
                  maxPrice={maxPrice}
                  totalProducts={products.length}
                  filteredCount={filteredProducts.length}
                  sortOption={sortOption}
                  onSortChange={setSortOption}
                  primaryColor={primaryColor}
                  isMobile={true}
                />
              </div>

              {/* Category Visual Showcase */}
              {categoryShowcase && !searchQuery && categories.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <span>Shop by Category</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </h2>
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x">
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={`snap-start shrink-0 w-32 md:w-36 aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all duration-300 border-2 ${
                        activeCategory === 'all' 
                          ? 'border-transparent shadow-xl ring-4 ring-offset-2 scale-[1.02] text-white' 
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:scale-105 text-slate-500'
                      }`}
                      style={activeCategory === 'all' ? { backgroundColor: primaryColor, '--tw-ring-color': `${primaryColor}50` } as any : {}}
                    >
                      <Tag className="w-8 h-8" />
                      <span className="font-bold text-sm">All Items</span>
                    </button>

                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.name)}
                        className={`snap-start shrink-0 w-32 md:w-36 aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all duration-300 border-2 ${
                          activeCategory === cat.name 
                            ? 'border-transparent shadow-xl ring-4 ring-offset-2 scale-[1.02] text-white' 
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:scale-105 text-slate-500'
                        }`}
                        style={activeCategory === cat.name ? { backgroundColor: primaryColor, '--tw-ring-color': `${primaryColor}50` } as any : {}}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner font-black uppercase" style={activeCategory !== cat.name ? {backgroundColor: `${primaryColor}10`, color: primaryColor}: {}}>
                          {cat.name.substring(0, 2)}
                        </div>
                        <span className="font-bold text-sm text-center px-3 line-clamp-1">
                          {cat.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {searchQuery ? `Search Results for "${searchQuery}"` : activeCategory !== 'all' ? activeCategory : 'Featured Collection'}
                </h2>
                <Badge variant="secondary" className="font-bold text-sm px-4 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hidden sm:inline-flex">
                  {filteredProducts.length} items
                </Badge>
              </div>

              <ProductGrid 
                products={filteredProducts} 
                businessPhone={profile.business_phone} 
                businessName={profile.business_name}
                theme={theme}
              />
            </div>
          </div>

          {/* Trust Badges Section */}
          {trustBadgesEnabled && theme.trustBadges?.length > 0 && !searchQuery && (
            <div className="my-20 py-12 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 px-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
               <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl -z-10" />
              <h3 className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">Why Shop With Us</h3>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 text-center z-10 relative">
                {theme.trustBadges.map((badgeId: string) => {
                  const bdg = trustBadgeIcons[badgeId]
                  if (!bdg) return null
                  const Icon = bdg.icon
                  return (
                    <div key={badgeId} className="flex flex-col items-center gap-4 group cursor-default">
                      <div className="w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-110 group-hover:shadow-xl" style={{ backgroundColor: `${primaryColor}15` }}>
                        <Icon className="w-8 h-8" style={{ color: primaryColor }} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{bdg.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Testimonials Section */}
          {testimonialsEnabled && theme.testimonials?.filter((t:any) => t.name && t.text).length > 0 && !searchQuery && (
            <div className="my-20">
              <h2 className="text-3xl font-black text-slate-900 mb-12 text-center">What Our Customers Say</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {theme.testimonials.filter((t:any) => t.name && t.text).map((t: any, i: number) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/50 relative hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute -top-6 left-8 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: primaryColor }}>
                      <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                    <div className="flex mb-4 mt-2">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-4 h-4 ${j < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-slate-600 mb-6 italic text-sm md:text-base leading-relaxed tracking-wide">&quot;{t.text}&quot;</p>
                    <div className="pt-4 border-t border-slate-100">
                      <p className="font-black text-slate-900 text-sm">{t.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating WhatsApp Widget */}
      {chatWidgetEnabled && (theme.socialWhatsApp || profile.business_phone) && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <div className="bg-white px-4 py-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hidden md:block animate-fade-in-up">
             <p className="text-xs font-bold text-slate-700 w-max tracking-wide">Hi! Need help? Chat with us.</p>
          </div>
          <a 
            href={`https://wa.me/${(theme.socialWhatsApp || profile.business_phone).replace(/[^\d]/g, '')}?text=${encodeURIComponent(theme.chatWidgetMessage || 'Hi!')}`}
            target="_blank" rel="noreferrer"
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/40 hover:scale-110 active:scale-95 transition-all duration-300 text-white relative group"
          >
            <MessageCircle className="w-8 h-8" />
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20 group-hover:opacity-0" />
          </a>
        </div>
      )}

      {/* Premium Footer */}
      <footer className="bg-white border-t border-slate-200 pt-20 pb-10 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            
            {/* Brand Column */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-4 mb-6">
                 {profile.avatar_url && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-slate-100 p-0.5">
                      <Image src={profile.avatar_url} alt={profile.business_name} width={48} height={48} className="object-cover rounded-[10px]" />
                    </div>
                 )}
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{profile.business_name}</h3>
              </div>
              <p className="text-sm text-slate-500 mb-8 max-w-sm leading-relaxed font-medium">
                {theme.footerAbout || profile.shop_description || 'Delivering excellence and premium quality products directly to you.'}
              </p>
              
              <div className="flex items-center gap-3">
                {theme.socialInstagram && <a href={`https://instagram.com/${theme.socialInstagram.replace('@','')}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all shadow-sm"><Instagram className="w-5 h-5" /></a>}
                {theme.socialFacebook && <a href={`https://facebook.com/${theme.socialFacebook}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"><Facebook className="w-5 h-5" /></a>}
                {theme.socialWhatsApp && <a href={`https://wa.me/${theme.socialWhatsApp.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all shadow-sm"><MessageCircle className="w-5 h-5" /></a>}
                {theme.socialYoutube && <a href={`https://youtube.com/${theme.socialYoutube}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"><Youtube className="w-5 h-5" /></a>}
              </div>
            </div>

            {/* Contact Column */}
            <div className="lg:col-span-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4 inline-block w-full">Get in Touch</h3>
              <ul className="space-y-4">
                {(theme.footerPhone || profile.business_phone) && (
                  <li>
                    <a href={`tel:${theme.footerPhone || profile.business_phone}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-indigo-600 transition-colors group p-2 -ml-2 rounded-xl hover:bg-slate-50">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{theme.footerPhone || profile.business_phone}</span>
                    </a>
                  </li>
                )}
                {(theme.footerEmail || profile.business_email) && (
                  <li>
                     <a href={`mailto:${theme.footerEmail || profile.business_email}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-indigo-600 transition-colors group p-2 -ml-2 rounded-xl hover:bg-slate-50">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{theme.footerEmail || profile.business_email}</span>
                    </a>
                  </li>
                )}
                {theme.footerAddress && (
                  <li className="flex items-start gap-3 text-sm text-slate-600 p-2 -ml-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="font-medium mt-2 leading-relaxed">{theme.footerAddress}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Policies Column */}
            <div className="lg:col-span-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4 inline-block w-full">Store Policies</h3>
              <ul className="space-y-6">
                {(theme.shippingInfo || true) && (
                  <li className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs font-black text-slate-900 mb-2 uppercase tracking-wide">Shipping</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{theme.shippingInfo || 'We deliver nationwide securely and fast.'}</p>
                  </li>
                )}
                {(theme.returnPolicy || true) && (
                  <li className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs font-black text-slate-900 mb-2 uppercase tracking-wide">Returns</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{theme.returnPolicy || '7-day easy returns policy.'}</p>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-slate-500 font-medium">
              © {new Date().getFullYear()} <span className="font-bold text-slate-900">{profile.business_name}</span>. All rights reserved.
            </p>
            <a href="https://resellerpro.in" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-indigo-50 rounded-full transition-colors group border border-slate-100">
              <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">Powered by</span>
              <span className="text-xs font-black tracking-tight text-slate-900 group-hover:text-indigo-700 transition-colors">ResellerPro</span> 
              <span className="text-indigo-500">⚡</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
