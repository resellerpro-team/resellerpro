'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, ShoppingBag, Heart, User, Menu, X, Store, Instagram, Facebook, Twitter, Youtube, Sparkles } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { CartDrawer } from './CartDrawer'
import type { ShopTheme } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

interface StoreHeaderProps {
  shopSlug: string
  shopName: string
  shopDescription?: string | null
  logoUrl?: string | null
  bannerUrl?: string | null
  announcement?: string | null
  theme: ShopTheme | null
  onSearch?: (q: string) => void
}

export function StoreHeader({
  shopSlug,
  shopName,
  logoUrl,
  announcement,
  theme,
  onSearch,
}: StoreHeaderProps) {
  const { getItemCount, toggleCart } = useCartStore()
  const [itemCount, setItemCount] = useState(0)
  const [query, setQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(2) // Premium dummy count to match mockup

  // Sync cart count on client only (hydration safe)
  useEffect(() => {
    setItemCount(getItemCount())
    const unsub = useCartStore.subscribe((state) => {
      setItemCount(state.getItemCount())
    })
    return unsub
  }, [getItemCount])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch?.(query)
  }

  const primaryColor = theme?.primaryColor || '#6366f1'

  // Pre-formatted links matching the mockup
  const navItems = [
    { label: 'Home', href: `/store/${shopSlug}` },
    { label: 'Shop', href: `/store/${shopSlug}#products` },
    { label: 'Collections', href: `/store/${shopSlug}#collections` },
    { label: 'New Arrivals', href: `/store/${shopSlug}#new-arrivals` },
    { label: 'Best Sellers', href: `/store/${shopSlug}#best-sellers` },
    { label: 'Offers', href: `/store/${shopSlug}#offers` },
  ]

  return (
    <>
      {/* Announcement Bar */}
      <div className="w-full bg-[#0f172a] text-[10px] sm:text-xs font-medium text-slate-200 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Free Delivery on orders above ₹999</span>
          </div>
          <div className="hidden md:block text-slate-300">
            <span>COD Available | Easy Returns</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Facebook className="w-3.5 h-3.5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Twitter className="w-3.5 h-3.5" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Youtube className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Sticky Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Name */}
          <Link href={`/store/${shopSlug}`} className="flex items-center gap-3 flex-shrink-0 group">
            {logoUrl ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-100 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Image src={logoUrl} alt={shopName} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-950 text-white font-extrabold text-xs shadow-sm">
                R
              </div>
            )}
            <span className="font-black text-slate-900 text-base tracking-tight uppercase group-hover:text-slate-700 transition-colors">
              {shopName}
            </span>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors tracking-tight"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: Search bar & User interaction icons */}
          <div className="flex items-center gap-3">
            {/* Search Input Box (Always visible on desktop) */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-48 lg:w-60">
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-full bg-slate-50 border border-slate-100 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 transition-all"
              />
              <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            </form>

            {/* Mobile Search Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-900 md:hidden transition-colors"
              aria-label="Search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => setWishlistCount(p => (p > 0 ? 0 : 2))}
              className="relative p-2 text-slate-600 hover:text-slate-950 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-[18px] h-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-slate-950 text-white text-[8px] font-bold flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Profile Icon */}
            <button className="p-2 text-slate-600 hover:text-slate-950 transition-colors" aria-label="Profile">
              <User className="w-[18px] h-[18px]" />
            </button>

            {/* Cart Icon */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-slate-600 hover:text-slate-950 transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-slate-950 text-white text-[8px] font-bold flex items-center justify-center border border-white">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Hamburger Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(p => !p)}
              className="p-2 text-slate-600 hover:text-slate-950 lg:hidden transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-lg p-5 flex flex-col gap-4 lg:hidden"
            >
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-100 text-xs focus:outline-none focus:bg-white"
                />
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </form>

              <div className="flex flex-col gap-3 py-2">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  )
}
