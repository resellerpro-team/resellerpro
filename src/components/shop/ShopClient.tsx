'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { ShopHeader } from '@/components/shop/ShopHeader'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { FilterBar } from '@/components/shop/FilterBar'

interface ShopClientProps {
  initialProducts: any[]
  categories: string[]
  maxPrice: number
  profile: any
}

export function ShopClient({ initialProducts, categories, maxPrice, profile }: ShopClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // States
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('minPrice')) || 0,
    Number(searchParams.get('maxPrice')) || maxPrice
  ])

  // Update URL params
  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === 'all' || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Effect to sync search from URL (e.g. if updated from header)
  useEffect(() => {
    const s = searchParams.get('search') || ''
    if (s !== search) setSearch(s)
  }, [searchParams])

  // Filtering logic
  const filteredProducts = useMemo(() => {
    const filtered = initialProducts.filter(product => {
      const matchesSearch = !search ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase())

      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory

      const matchesPrice = product.selling_price >= priceRange[0] && product.selling_price <= priceRange[1]

      return matchesSearch && matchesCategory && matchesPrice
    })

    // Sort
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-low') return a.selling_price - b.selling_price
      if (sortBy === 'price-high') return b.selling_price - a.selling_price
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return 0
    })
  }, [initialProducts, search, selectedCategory, priceRange, sortBy])

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <ShopHeader
        businessName={profile.business_name}
        businessLogo={profile.avatar_url}
        description={profile.shop_description}
        theme={profile.shop_theme}
        onSearch={(value) => {
          setSearch(value)
          updateParams({ search: value })
        }}
        initialSearch={search}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <FilterBar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={(cat: string) => {
                setSelectedCategory(cat)
                updateParams({ category: cat })
              }}
              priceRange={priceRange}
              onPriceChange={(range: [number, number]) => {
                setPriceRange(range)
                updateParams({
                  minPrice: range[0].toString(),
                  maxPrice: range[1].toString()
                })
              }}
              maxPrice={maxPrice}
              totalProducts={initialProducts.length}
              filteredCount={filteredProducts.length}
            />
          </aside>

          {/* Mobile Filter Button & Results Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {selectedCategory === 'all' ? 'All Products' : selectedCategory}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-slate-500 font-medium">
                    {filteredProducts.length} items
                  </p>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <button
                    onClick={() => {
                      setSearch('')
                      setSelectedCategory('all')
                      setPriceRange([0, maxPrice])
                      setSortBy('newest')
                      updateParams({ search: null, category: null, minPrice: null, maxPrice: null, sort: null })
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Reset all
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Select */}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value)
                    updateParams({ sort: e.target.value })
                  }}
                  className="h-10 md:h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                {/* Mobile Filter Bar Trigger (hidden on desktop) */}
                <div className="md:hidden flex-1 sm:flex-initial">
                  <FilterBar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={(cat: string) => {
                      setSelectedCategory(cat)
                      updateParams({ category: cat })
                    }}
                    priceRange={priceRange}
                    onPriceChange={(range: [number, number]) => {
                      setPriceRange(range)
                      updateParams({
                        minPrice: range[0].toString(),
                        maxPrice: range[1].toString()
                      })
                    }}
                    maxPrice={maxPrice}
                    isMobile
                    totalProducts={initialProducts.length}
                    filteredCount={filteredProducts.length}
                  />
                </div>
              </div>
            </div>

            <ProductGrid
              products={filteredProducts}
              businessPhone={profile.business_phone || profile.phone}
              businessName={profile.business_name}
              theme={profile.shop_theme}
            />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Powered by ResellerPro
          </p>
        </div>
      </footer>
    </div>
  )
}
