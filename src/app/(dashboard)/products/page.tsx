export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { ProductsClient } from './ProductsClient'

export default async function ProductsPage(props: {
  searchParams: Promise<{ search?: string; category?: string; sort?: string; view?: string }>
}) {
  // Await searchParams in Next.js 15
  const searchParams = await props.searchParams
  
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div>Please log in</div>
  }

  // Build query
  let query = supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)

  // Apply search filter
  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%,category.ilike.%${searchParams.search}%,sku.ilike.%${searchParams.search}%`)
  }

  // Apply category filter
  if (searchParams.category && searchParams.category !== 'all') {
    if (searchParams.category === 'low_stock') {
      query = query.eq('stock_status', 'low_stock')
    } else if (searchParams.category === 'out_of_stock') {
      query = query.eq('stock_status', 'out_of_stock')
    } else {
      query = query.eq('category', searchParams.category)
    }
  }

  // Apply sorting
  const sortBy = searchParams.sort || '-created_at'
  const sortOrder = sortBy.startsWith('-')
  const sortField = sortBy.replace('-', '')
  
  query = query.order(sortField, { ascending: !sortOrder })

  const { data: products, error } = await query
   console.log("products-------2",products);
   
  if (error) {
    console.error('Error fetching products:', error)
    return <div>Error loading products</div>
  }

  // Calculate stats
  const total = products?.length || 0
  const totalValue = products?.reduce((sum, p) => sum + ((p.selling_price || 0) * (p.stock_quantity || 0)), 0) || 0
  const totalProfit = products?.reduce((sum, p) => {
    const profit = ((p.selling_price || 0) - (p.cost_price || 0)) * (p.stock_quantity || 0)
    return sum + profit
  }, 0) || 0
  const avgMargin = total > 0
    ? products!.reduce((sum, p) => {
        const margin = p.selling_price > 0 
          ? ((p.selling_price - p.cost_price) / p.selling_price) * 100 
          : 0
        return sum + margin
      }, 0) / total
    : 0
  const lowStock = products?.filter(p => p.stock_status === 'low_stock').length || 0
  const outOfStock = products?.filter(p => p.stock_status === 'out_of_stock').length || 0
  const inStock = products?.filter(p => p.stock_status === 'in_stock').length || 0

  // Get unique categories
  const categories = [...new Set(products?.map(p => p.category).filter(Boolean))] as string[]

  const stats = {
    total,
    totalValue,
    totalProfit,
    avgMargin: avgMargin.toFixed(1),
    lowStock,
    outOfStock,
    inStock,
  }

  return (
    <ProductsClient 
      initialProducts={products || []} 
      stats={stats}
      categories={categories}
      currentView={searchParams.view || 'grid'}
    />
  )
}