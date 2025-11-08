'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  ArrowUpDown,
  Loader2,
  Plus,
  Package,
  ShoppingCart,
  TrendingUp,
  IndianRupee,
} from 'lucide-react'
import Link from 'next/link'
import { OrdersTable } from '@/components/orders/OrderTable'

export function OrdersClient({
  initialOrders,
  stats,
  statuses,
  payments,
  currentSort,
  currentStatus,
  currentPayment,
  currentSearch,
}: {
  initialOrders: any[]
  stats: any
  statuses: string[]
  payments: string[]
  currentSort: string
  currentStatus: string
  currentPayment: string
  currentSearch: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch)

  // 🔁 Update URL with new params
  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all') newParams.set(key, value)
      else newParams.delete(key)
    })
    startTransition(() => router.push(`/orders?${newParams.toString()}`))
  }

  // 🔍 Debounced live search (auto updates after 500ms)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const trimmed = search.trim()

      // 🧠 Skip invalid searches (like only '#' or empty)
      if (trimmed === '' || trimmed === '#') return

      updateURL({ search: trimmed })
    }, 500)

    return () => clearTimeout(delayDebounce)
  }, [search])

  const handleSortChange = (value: string) => updateURL({ sort: value })
  const handleStatusChange = (value: string) => updateURL({ status: value })
  const handlePaymentChange = (value: string) => updateURL({ payment: value })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and track your orders</p>
        </div>
        <Button asChild>
          <Link href="/orders/new">
            <Plus className="mr-2 h-4 w-4" /> New Order
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Orders"
          icon={ShoppingCart}
          value={stats.totalOrders}
          subtitle={`${stats.completedOrders} completed`}
        />
        <StatsCard
          title="Revenue"
          icon={IndianRupee}
          value={`₹${stats.totalRevenue.toFixed(2)}`}
          subtitle="Total income"
        />
        <StatsCard
          title="Profit"
          icon={TrendingUp}
          value={`₹${stats.totalProfit.toFixed(2)}`}
          subtitle="Net profit"
        />
        <StatsCard
          title="Pending"
          icon={Package}
          value={stats.pendingOrders}
          subtitle="Awaiting completion"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, #order, or phone..."
              className="pl-10 pr-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isPending}
            />

            {/*  Smooth spinner animation */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center">
              <Loader2
              style={{ animationDuration: '1.1s' }}
                className={`h-4 w-4 text-muted-foreground transition-opacity duration-300 ${
                  isPending ? 'opacity-100 animate-spin' : 'opacity-0'
                }`}
              />
            </div>
          </div>

          {/* Status Filter */}
          <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isPending}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Payment Filter */}
          <Select value={currentPayment} onValueChange={handlePaymentChange} disabled={isPending}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Payments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              {['paid', 'unpaid', 'partially_paid', 'refunded'].map((p) => (
                <SelectItem key={p} value={p}>
                  {p.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isPending}>
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
              <DropdownMenuItem onClick={() => handleSortChange('-total_amount')}>
                Amount (High to Low)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('total_amount')}>
                Amount (Low to High)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className='select-none'>
          {initialOrders.length > 0 ? (
            <div
              className={`transition-all duration-300 ${
                isPending ? 'opacity-60 blur-[1px]' : 'opacity-100'
              }`}
            >
              <OrdersTable orders={initialOrders} />
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 opacity-50 mb-4" />
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm">Try adjusting filters or search terms</p>
            </div>
          )}
      </Card>
    </div>
  )
}

// Stats Card Component
function StatsCard({ title, icon: Icon, value, subtitle }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  )
}
