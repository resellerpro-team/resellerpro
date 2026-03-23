'use client'

import React, { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { ShopHeader } from './ShopHeader'
import { ProductGrid } from './ProductGrid'
import { Button } from '@/components/ui/button'
import { ExternalLink, HelpCircle, Inbox, Tag, Star, MapPin, Mail, Phone, MessageCircle, Shield, Truck, RotateCcw, HeartHandshake, Check } from 'lucide-react'
import Image from 'next/image'

interface ShopClientProps {
  profile: any
  products: any[]
  categories: any[]
}

export function ShopClient({ profile, products, categories }: ShopClientProps) {
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')

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
            target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all">
            <MessageCircle className="w-5 h-5" /> Leave a Message
          </a>
        </div>
      </div>
    )
  }

  // Derived state
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory ? p.category === activeCategory : true
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, activeCategory, searchQuery])

  // Trust Badges Map
  const trustBadgeIcons: Record<string, { icon: any, label: string }> = {
    'secure_payment': { icon: Shield, label: 'Secure Payment' },
    'fast_delivery': { icon: Truck, label: 'Fast Delivery' },
    'easy_returns': { icon: RotateCcw, label: 'Easy Returns' },
    'quality': { icon: Star, label: 'Quality Assured' },
    'support': { icon: HeartHandshake, label: '24/7 Support' },
    'authentic': { icon: Check, label: '100% Authentic' },
  }

  return (
    <div className={`min-h-screen bg-slate-50 relative ${colorScheme === 'dark' ? 'dark' : ''}`}>
      {theme.customCss && <style dangerouslySetInnerHTML={{ __html: theme.customCss }} />}

      {/* Header */}
      <ShopHeader 
        businessName={profile.business_name}
        businessLogo={profile.avatar_url}
        description={profile.shop_description}
        theme={theme}
        onSearch={setSearchQuery}
        initialSearch={searchQuery}
      />

      <main className="pb-24">
        {/* Hero Banner Section */}
        {heroEnabled && !searchQuery && (
          <div className="relative overflow-hidden w-full" style={{ backgroundColor: theme.heroBgColor || primaryColor }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 text-center flex flex-col items-center justify-center">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight max-w-4xl tracking-tight">
                {theme.heroTitle || `Welcome to ${profile.business_name}`}
              </h1>
              <p className="mt-4 md:mt-6 text-base md:text-xl text-white/90 max-w-2xl font-medium">
                {theme.heroSubtitle || profile.shop_description || 'Discover our premium collection.'}
              </p>
              {theme.heroCtaText && (
                <a href={theme.heroCtaLink || '#products'}
                  className="mt-8 px-8 py-3.5 bg-white font-bold rounded-full shadow-xl hover:scale-105 transition-transform active:scale-95 border-2 border-white/50 inline-flex items-center gap-2"
                  style={{ color: theme.heroBgColor || primaryColor }}>
                  {theme.heroCtaText} <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>
            
            {/* Background Patterns */}
            {theme.heroPattern === 'dots' && <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)', backgroundSize: '24px 24px'}} />}
            {theme.heroPattern === 'waves' && <div className="absolute inset-0 opacity-10" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`}} />}
            {theme.heroPattern === 'gradient' && <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8" id="products">
          {/* Category Showcase (Visual Cards) */}
          {categoryShowcase && !searchQuery && categories.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 mb-4 px-2">Shop by Category</h2>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-2 snap-x">
                {/* "All" Category card */}
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`snap-start shrink-0 w-32 md:w-40 aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border-2 ${
                    activeCategory === null 
                      ? 'border-transparent shadow-xl ring-2 ring-offset-2 scale-[1.02]' 
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:scale-105'
                  }`}
                  style={activeCategory === null ? { backgroundColor: primaryColor, '--tw-ring-color': primaryColor } as any : {}}
                >
                  <Tag className={`w-8 h-8 ${activeCategory === null ? 'text-white' : 'text-slate-400'}`} />
                  <span className={`font-bold text-sm ${activeCategory === null ? 'text-white' : 'text-slate-600'}`}>All Products</span>
                </button>

                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`snap-start shrink-0 w-32 md:w-40 aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border-2 ${
                      activeCategory === cat.name 
                        ? 'border-transparent shadow-xl ring-2 ring-offset-2 scale-[1.02]' 
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:scale-105'
                    }`}
                    style={activeCategory === cat.name ? { backgroundColor: primaryColor, '--tw-ring-color': primaryColor } as any : {}}
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl shadow-inner font-bold text-slate-400 capitalize">
                      {cat.name.charAt(0)}
                    </div>
                    <span className={`font-bold text-sm text-center px-2 line-clamp-1 ${activeCategory === cat.name ? 'text-white' : 'text-slate-600'}`}>
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Simple Category Pills (shows if showcase is disabled or searching) */}
          {(!categoryShowcase || searchQuery) && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeCategory === null ? 'text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
                style={activeCategory === null ? { backgroundColor: primaryColor } : {}}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    activeCategory === cat.name ? 'text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                  style={activeCategory === cat.name ? { backgroundColor: primaryColor } : {}}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Main Content Area */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">
                {searchQuery ? `Search Results for "${searchQuery}"` : activeCategory ? activeCategory : 'Featured Collection'}
              </h2>
              <Badge variant="secondary" className="font-bold text-sm px-3 py-1">
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

          {/* Trust Badges Section */}
          {trustBadgesEnabled && theme.trustBadges?.length > 0 && !searchQuery && (
            <div className="my-16 py-10 bg-white rounded-3xl border border-slate-100 shadow-sm px-6">
              <h3 className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Why Shop With Us</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {theme.trustBadges.map((badgeId: string) => {
                  const bdg = trustBadgeIcons[badgeId]
                  if (!bdg) return null
                  const Icon = bdg.icon
                  return (
                    <div key={badgeId} className="flex flex-col items-center text-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform hover:scale-110" style={{ backgroundColor: `${primaryColor}15` }}>
                        <Icon className="w-6 h-6" style={{ color: primaryColor }} />
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
            <div className="my-16">
              <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">What Our Customers Say</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {theme.testimonials.filter((t:any) => t.name && t.text).map((t: any, i: number) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative pt-10">
                    <div className="absolute top-0 left-6 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: primaryColor }}>
                      <Star className="w-5 h-5 text-white fill-white" />
                    </div>
                    <div className="flex mb-3">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-4 h-4 ${j < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-slate-600 mb-4 italic text-sm leading-relaxed">&quot;{t.text}&quot;</p>
                    <p className="font-bold text-slate-900 text-sm">— {t.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating WhatsApp Widget */}
      {chatWidgetEnabled && (theme.socialWhatsApp || profile.business_phone) && (
        <a 
          href={`https://wa.me/${(theme.socialWhatsApp || profile.business_phone).replace(/[^\d]/g, '')}?text=${encodeURIComponent(theme.chatWidgetMessage || 'Hi!')}`}
          target="_blank" rel="noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
        >
          <div className="bg-white px-4 py-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hidden md:block animate-fade-in-up">
            <p className="text-xs font-bold text-slate-600 w-max">Need help? Chat with us</p>
          </div>
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 hover:scale-110 active:scale-95 transition-all text-white">
            <MessageCircle className="w-7 h-7" />
          </div>
        </a>
      )}

      {/* Custom Shopify-style Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-black text-slate-900 mb-4">{profile.business_name}</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm leading-relaxed">
                {theme.footerAbout || profile.shop_description || 'Thank you for visiting our store. We provide top quality products directly to you.'}
              </p>
              
              <div className="flex items-center gap-3">
                {theme.socialInstagram && <a href={`https://instagram.com/${theme.socialInstagram.replace('@','')}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-pink-600 transition-colors"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="IG" width={20} height={20} className="opacity-70 hover:opacity-100" /></a>}
                {theme.socialFacebook && <a href={`https://facebook.com/${theme.socialFacebook}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="FB" width={20} height={20} className="opacity-70 hover:opacity-100" /></a>}
                {theme.socialTwitter && <a href={`https://twitter.com/${theme.socialTwitter.replace('@','')}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-sky-500 transition-colors"><img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Twitter" width={20} height={20} className="opacity-70 hover:opacity-100" /></a>}
              </div>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Contact Us</h3>
              <ul className="space-y-3">
                {(theme.footerPhone || profile.business_phone) && (
                  <li className="flex gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                    <span>{theme.footerPhone || profile.business_phone}</span>
                  </li>
                )}
                {(theme.footerEmail || profile.business_email) && (
                  <li className="flex gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                    <span>{theme.footerEmail || profile.business_email}</span>
                  </li>
                )}
                {theme.footerAddress && (
                  <li className="flex gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                    <span>{theme.footerAddress}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Policies Column */}
            {(theme.returnPolicy || theme.shippingInfo) && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Store Policies</h3>
                <ul className="space-y-4">
                  {theme.shippingInfo && (
                    <li>
                      <p className="text-xs font-bold text-slate-900 mb-1">Shipping</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{theme.shippingInfo}</p>
                    </li>
                  )}
                  {theme.returnPolicy && (
                    <li>
                      <p className="text-xs font-bold text-slate-900 mb-1">Returns</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{theme.returnPolicy}</p>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} {profile.business_name}. All rights reserved.
            </p>
            <a href="https://resellerpro.in" target="_blank" rel="noreferrer" className="text-[10px] font-medium text-slate-400 hover:text-indigo-600 flex items-center gap-1">
              Powered by <span className="font-bold">ResellerPro</span> ⚡
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
