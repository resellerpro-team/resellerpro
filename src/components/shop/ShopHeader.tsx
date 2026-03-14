'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Search } from 'lucide-react'
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
  const [searchValue, setSearchValue] = React.useState(initialSearch || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchValue)
  }

  return (
    <header className="bg-white border-b sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          {/* Logo & Name */}
          <Link href="/" className="flex items-center gap-3 md:gap-4 flex-shrink-0">
            <div 
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white font-bold text-base md:text-lg overflow-hidden shadow-md flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              {businessLogo ? (
                <Image src={businessLogo} alt={businessName} width={48} height={48} className="object-cover" />
              ) : (
                businessName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-black text-slate-900 leading-none">{businessName}</h1>
              {description && <p className="text-[10px] md:text-sm text-slate-500 mt-1 line-clamp-1 max-w-[200px]">{description}</p>}
            </div>
          </Link>
          
          {/* Search - Desktop & Tablet */}
          <div className="flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value)
                  // Optional: real-time search
                  // onSearch?.(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSearch?.(searchValue)
                  }
                }}
                placeholder="Search products..." 
                className="pl-10 h-10 md:h-11 rounded-full bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all border-0 ring-1 ring-slate-200"
              />
            </form>
          </div>

          {/* Contact Button */}
          <div className="hidden md:block">
            <Button variant="outline" className="rounded-xl gap-2 font-bold h-11 border-slate-200 hover:bg-slate-50 active:scale-95 transition-all">
              <ShoppingBag className="w-4 h-4" />
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
