'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Search, Instagram, Facebook, Twitter, MessageCircle, Youtube } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ShopHeaderProps {
  businessName: string
  businessLogo?: string
  description?: string
  theme?: any
  onSearch?: (value: string) => void
  initialSearch?: string
}

export function ShopHeader({ businessName, businessLogo, description, theme, onSearch, initialSearch }: ShopHeaderProps) {
  const primaryColor = theme?.primaryColor || '#4f46e5'
  const bannerEnabled = theme?.bannerEnabled || false
  const bannerText = theme?.bannerText || ''
  
  const socialInstagram = theme?.socialInstagram || ''
  const socialFacebook = theme?.socialFacebook || ''
  const socialYoutube = theme?.socialYoutube || ''
  const socialWhatsApp = theme?.socialWhatsApp || ''
  
  const hasSocials = socialInstagram || socialFacebook || socialYoutube || socialWhatsApp

  const [searchValue, setSearchValue] = useState(initialSearch || '')
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchValue)
  }

  return (
    <>
      {/* Announcement Banner */}
      {bannerEnabled && bannerText && (
        <div className="py-2.5 px-4 text-center text-xs md:text-sm font-bold text-white relative overflow-hidden group"
          style={{ backgroundColor: primaryColor }}>
          <span className="relative z-10">{bannerText}</span>
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out skew-x-12" />
        </div>
      )}

      <header className="bg-white/80 border-b border-slate-200/60 sticky top-0 z-50 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* Logo & Name */}
            <Link href="/" className="flex items-center gap-3 md:gap-4 flex-shrink-0 group">
              <div
                className="w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white font-black text-base md:text-xl overflow-hidden shadow-lg shadow-black/5 group-hover:scale-105 transition-all duration-300 flex-shrink-0 border-2 border-white"
                style={{ backgroundColor: primaryColor }}
              >
                {businessLogo ? (
                  <Image src={businessLogo} alt={businessName} width={56} height={56} className="object-cover w-full h-full" />
                ) : (
                  businessName.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-2xl font-black text-slate-900 leading-none tracking-tight group-hover:text-slate-700 transition-colors">{businessName}</h1>
                {description && <p className="text-[10px] md:text-xs font-medium text-slate-500 mt-1 line-clamp-1 max-w-[250px]">{description}</p>}
              </div>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-2xl relative z-10">
              <form onSubmit={handleSearch} className="relative w-full group">
                <div className={`absolute inset-0 rounded-full transition-all duration-500 blur-md ${isFocused ? 'opacity-30' : 'opacity-0'}`} style={{ backgroundColor: primaryColor }} />
                <div className="relative">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 ${isFocused ? 'text-indigo-600' : 'text-slate-400'}`} style={isFocused ? { color: primaryColor } : {}} />
                  <Input
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value)
                      onSearch?.(e.target.value) // Live search
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Search for matching products..."
                    className="pl-12 pr-4 h-11 md:h-14 lg:text-base rounded-full bg-slate-100/80 border-transparent focus:bg-white focus:ring-4 transition-all duration-300 shadow-inner group-hover:bg-white"
                    style={isFocused ? { borderColor: primaryColor, '--tw-ring-color': `${primaryColor}30` } as any : {}}
                  />
                  {searchValue && (
                    <button 
                      type="button"
                      onClick={() => {
                        setSearchValue('')
                        onSearch?.('')
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-xs hover:bg-slate-300 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Social + Contact */}
            <div className="hidden lg:flex items-center gap-4">
              {hasSocials && (
                <div className="flex items-center gap-1.5 mr-2">
                  {socialInstagram && (
                    <a href={socialInstagram.startsWith('http') ? socialInstagram : `https://instagram.com/${socialInstagram.replace('@', '')}`}
                      target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-pink-50 hover:text-pink-600 transition-all text-slate-400 group">
                      <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                  {socialFacebook && (
                    <a href={socialFacebook.startsWith('http') ? socialFacebook : `https://facebook.com/${socialFacebook}`}
                      target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-all text-slate-400 group">
                      <Facebook className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                  {socialYoutube && (
                    <a href={socialYoutube.startsWith('http') ? socialYoutube : `https://youtube.com/${socialYoutube}`}
                      target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-500 transition-all text-slate-400 group">
                      <Youtube className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                  {socialWhatsApp && (
                    <a href={`https://wa.me/${socialWhatsApp.replace(/[^\d]/g, '')}`}
                      target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-green-50 hover:text-green-500 transition-all text-slate-400 group">
                      <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                </div>
              )}
              <Button 
                variant="default" 
                className="rounded-full px-6 font-bold h-11 shadow-lg hover:shadow-xl transition-all active:scale-95 group text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
