'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Search, 
  Package, 
  TrendingUp, 
  DollarSign,
  Download,
  Grid3x3,
  List,
  AlertTriangle,
  ArrowUpDown,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductRow } from '@/components/products/ProductRow'

type Product = {
  id: string
  name: string
  description?: string
  image_url: string | null
  images?: string[]
  cost_price: number
  selling_price: number
  stock_quantity?: number
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'
  category?: string
  sku?: string
  created_at: string
}

type Stats = {
  total: number
  totalValue: number
  totalProfit: number
  avgMargin: string
  lowStock: number
  outOfStock: number
  inStock: number
}

type ProductsClientProps = {
  initialProducts: Product[]
  stats: Stats
  categories: string[]
  currentView: string
}

export function ProductsClient({ 
  initialProducts, 
  stats, 
  categories,
  currentView 
}: ProductsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [view, setView] = useState<'grid' | 'list'>(currentView as 'grid' | 'list')

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all') {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })

    startTransition(() => {
      router.push(`/products?${newParams.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL({ search })
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    // Debounce search
    if (value === '') {
      updateURL({ search: '' })
    }
  }

  const handleCategoryChange = (value: string) => {
    updateURL({ category: value })
  }

  const handleSortChange = (value: string) => {
    updateURL({ sort: value })
  }

  const handleViewChange = (value: 'grid' | 'list') => {
    setView(value)
    updateURL({ view: value })
  }

  const exportToCSV = () => {
    const headers = ['Name', 'SKU', 'Category', 'Cost Price', 'Selling Price', 'Profit', 'Margin %', 'Stock', 'Status']
    
    const rows = initialProducts.map(p => {
      const profit = p.selling_price - p.cost_price
      const margin = p.selling_price > 0 ? ((profit / p.selling_price) * 100).toFixed(2) : '0'
      
      return [
        `"${p.name}"`,
        p.sku || '',
        p.category || 'Uncategorized',
        p.cost_price,
        p.selling_price,
        profit.toFixed(2),
        margin,
        p.stock_quantity || 0,
        p.stock_status.replace('_', ' ')
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToCSV} disabled={isPending}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild>
            <Link href="/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          icon={Package}
          value={stats.total}
          subtitle={`${stats.inStock} in stock`}
          trend={stats.total > 0 ? '+12%' : undefined}
        />
        <StatsCard
          title="Inventory Value"
          icon={DollarSign}
          value={`₹${stats.totalValue.toLocaleString()}`}
          subtitle="Total selling price"
          trend="+8%"
        />
        <StatsCard
          title="Total Profit Potential"
          icon={TrendingUp}
          value={`₹${stats.totalProfit.toLocaleString()}`}
          subtitle={`${stats.avgMargin}% avg margin`}
          trend="+15%"
          trendUp
        />
        <StatsCard
          title="Stock Alerts"
          icon={AlertTriangle}
          value={stats.lowStock + stats.outOfStock}
          subtitle={`${stats.lowStock} low, ${stats.outOfStock} out`}
          warning={stats.lowStock > 0 || stats.outOfStock > 0}
        />
      </div>

      {/* Low Stock Alert */}
      {(stats.lowStock > 0 || stats.outOfStock > 0) && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-sm">Stock Alert</p>
                <p className="text-sm text-muted-foreground">
                  {stats.lowStock} product(s) running low, {stats.outOfStock} out of stock
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleCategoryChange('low_stock')}
              disabled={isPending}
            >
              View Products
            </Button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, category, or SKU..."
                className="pl-10"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                disabled={isPending}
              />
              {isPending && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </form>

            {/* Category Filter */}
            <Select 
              value={searchParams.get('category') || 'all'}
              onValueChange={handleCategoryChange}
              disabled={isPending}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
                <SelectItem value="low_stock">⚠ Low Stock</SelectItem>
                <SelectItem value="out_of_stock">✗ Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto" disabled={isPending}>
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => handleSortChange('-created_at')}>
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('created_at')}>
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('name')}>
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('-name')}>
                  Name (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('-selling_price')}>
                  Price (High to Low)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('selling_price')}>
                  Price (Low to High)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('-stock_quantity')}>
                  Stock (High to Low)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={view === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('grid')}
                className="px-3"
                disabled={isPending}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('list')}
                className="px-3"
                disabled={isPending}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Display */}
      {isPending ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 text-muted-foreground/20 mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Loading products...</h3>
          </CardContent>
        </Card>
      ) : initialProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              {searchParams.get('search') || searchParams.get('category')
                ? 'Try adjusting your filters or search terms'
                : 'Get started by adding your first product to the catalog'}
            </p>
            {!searchParams.get('search') && !searchParams.get('category') && (
              <Button asChild>
                <Link href="/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : view === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {initialProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {initialProducts.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      {initialProducts.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {initialProducts.length} {initialProducts.length === 1 ? 'product' : 'products'}
        </div>
      )}
    </div>
  )
}

// Stats Card Component
function StatsCard({
  title,
  icon: Icon,
  value,
  subtitle,
  trend,
  trendUp = true,
  warning = false,
}: {
  title: string
  icon: any
  value: string | number
  subtitle: string
  trend?: string
  trendUp?: boolean
  warning?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${warning ? 'text-yellow-600' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${warning ? 'text-yellow-600' : ''}`}>
          {value}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">{subtitle}</p>
          {trend && (
            <Badge 
              variant="secondary" 
              className={`text-xs ${trendUp ? 'text-green-600' : 'text-red-600'}`}
            >
              {trend}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}