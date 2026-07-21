'use client'

import { StoreProductCard } from './StoreProductCard'
import type { Product, ShopTheme } from '@/types'

interface StoreProductGridProps {
  products: Product[]
  storeUserId: string
  theme: ShopTheme | null
  layout?: 'grid' | 'list'
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-8 bg-slate-200 rounded-xl mt-3" />
      </div>
    </div>
  )
}

export function StoreProductGrid({ products, storeUserId, theme, layout = 'grid' }: StoreProductGridProps) {
  const activeLayout = theme?.layout || layout

  // Curated premium mockup products for empty state preview
  const mockProducts: Product[] = [
    {
      id: 'mock-1',
      user_id: 'mock-user',
      sku: 'MOCK-001',
      name: 'Luxury Velvet Kurta Set',
      description: 'Elegant designer kurta set with detailed hand embroidery, perfect for festive occasions.',
      price: 1899,
      selling_price: 1899,
      compare_at_price: 3799,
      image_url: null,
      stock_status: 'in_stock',
      category: 'Festive Wear',
      cost_price: 900,
      stock_quantity: 10,
      is_active: true,
      profit: 999,
      profit_margin: 52,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-2',
      user_id: 'mock-user',
      sku: 'MOCK-002',
      name: 'Handcrafted Bridal Juttis',
      description: 'Premium leather juttis adorned with beads and zardozi work for ultimate style and comfort.',
      price: 1299,
      selling_price: 1299,
      compare_at_price: 2599,
      image_url: null,
      stock_status: 'low_stock',
      category: 'Footwear',
      cost_price: 600,
      stock_quantity: 3,
      is_active: true,
      profit: 699,
      profit_margin: 53,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-3',
      user_id: 'mock-user',
      sku: 'MOCK-003',
      name: 'Royal Kundan Choker Set',
      description: 'Stunning gold plated choker necklace with matching earrings. Perfect for weddings.',
      price: 2499,
      selling_price: 2499,
      compare_at_price: 4999,
      image_url: null,
      stock_status: 'in_stock',
      category: 'Jewelry',
      cost_price: 1200,
      stock_quantity: 8,
      is_active: true,
      profit: 1299,
      profit_margin: 52,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-4',
      user_id: 'mock-user',
      sku: 'MOCK-004',
      name: 'Banarasi Silk Dupatta',
      description: 'Gorgeously woven silk dupatta featuring classic zari borders and beautiful patterns.',
      price: 799,
      selling_price: 799,
      compare_at_price: 1599,
      image_url: null,
      stock_status: 'in_stock',
      category: 'Accessories',
      cost_price: 350,
      stock_quantity: 15,
      is_active: true,
      profit: 449,
      profit_margin: 56,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  if (products.length === 0) {
    return (
      <div className="space-y-8">
        {/* Helper Banner for Shop Owner */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-6 sm:p-8 border border-indigo-100/50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-700 uppercase tracking-wider">
              ✨ Store Setup Guide
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">Your store is online & active!</h3>
            <p className="text-sm text-slate-600 max-w-lg">
              Below is a preview of how your products will display. Complete your onboarding or head to your dashboard to add your first product and start selling!
            </p>
          </div>
          <a
            href="/products"
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-all shadow-md shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            ➕ Add Your First Product
          </a>
        </div>

        {/* Mock Product Showcase */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>🛍️</span> Showcase Preview (Samples)
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-200 bg-slate-50 px-2.5 py-1 rounded-lg">
              Preview Mode
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 opacity-75 select-none pointer-events-none">
            {mockProducts.map((product) => (
              <div key={product.id} className="relative">
                <StoreProductCard
                  product={product}
                  storeUserId={storeUserId}
                  layout="grid"
                  theme={theme ? { buttonStyle: theme.buttonStyle, showPrices: theme.showPrices } : undefined}
                />
                <div className="absolute top-2 right-2 z-20 bg-indigo-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase shadow">
                  Sample
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (activeLayout === 'list') {
    return (
      <div className="space-y-3">
        {products.map((product) => (
          <StoreProductCard
            key={product.id}
            product={product}
            storeUserId={storeUserId}
            layout="list"
            theme={theme ? { buttonStyle: theme.buttonStyle, showPrices: theme.showPrices } : undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product) => (
        <StoreProductCard
          key={product.id}
          product={product}
          storeUserId={storeUserId}
          layout="grid"
          theme={theme ? { buttonStyle: theme.buttonStyle, showPrices: theme.showPrices } : undefined}
        />
      ))}
    </div>
  )
}

export function StoreProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
