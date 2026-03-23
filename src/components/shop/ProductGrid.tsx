'use client'

import React from 'react'
import { ProductCard } from './ProductCard'
import { cn } from '@/lib/utils'

interface ProductGridProps {
  products: any[]
  businessPhone: string
  businessName: string
  theme?: any
}

export function ProductGrid({ products, businessPhone, businessName, theme }: ProductGridProps) {
  const layout = theme?.layout || 'grid'

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="text-2xl font-black text-slate-900">No products match your filters</h3>
        <p className="text-slate-500 mt-3 max-w-sm mx-auto font-medium">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    )
  }

  return (
    <div className={cn(
      layout === 'list'
        ? 'flex flex-col gap-3'
        : layout === 'compact'
        ? 'grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'
        : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6'
    )}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          businessPhone={businessPhone}
          businessName={businessName}
          theme={theme}
          layout={layout}
        />
      ))}
    </div>
  )
}
