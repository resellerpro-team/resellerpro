export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangePicker } from '@/components/analytics/DateRangePicker'
import { SalesProfitChart } from '@/components/analytics/SalesProfitChart'
import { RevenueByCategoryChart } from '@/components/analytics/RevenueByCategoryChart'
import { PaymentStatusChart } from '@/components/analytics/PaymentStatusChart'
import { OrderStatusChart } from '@/components/analytics/OrderStatusChart'
import { ExportButton } from '@/components/analytics/ExportButton'
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  ArrowRight,
  User,
  Percent,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'

export const metadata = {
  title: 'Analytics - ResellerPro',
  description: 'Detailed analytics and reports for your business',
}

// Helper function to calculate percentage change
function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%'
  const change = ((current - previous) / previous) * 100
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

// Helper function to get date ranges
function getDateRanges(params: { from?: string; to?: string }) {
  const now = new Date()
  
  // If custom dates provided, use them
  if (params.from && params.to) {
    const fromDate = new Date(params.from)
    fromDate.setHours(0, 0, 0, 0)
    const toDate = new Date(params.to)
    toDate.setHours(23, 59, 59, 999)
    
    // Calculate the difference in days
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // Calculate previous period (same duration)
    const previousEnd = new Date(fromDate)
    previousEnd.setDate(previousEnd.getDate() - 1)
    previousEnd.setHours(23, 59, 59, 999)
    const previousStart = new Date(previousEnd)
    previousStart.setDate(previousStart.getDate() - diffDays)
    previousStart.setHours(0, 0, 0, 0)
    
    return {
      currentStart: fromDate.toISOString(),
      currentEnd: toDate.toISOString(),
      lastStart: previousStart.toISOString(),
      lastEnd: previousEnd.toISOString(),
      periodLabel: 'from previous period',
      hasFilter: true,
    }
  }
  
  // Default: All time (no date filter)
  const currentEnd = new Date()
  currentEnd.setHours(23, 59, 59, 999)
  const currentStart = new Date()
  currentStart.setDate(currentStart.getDate() - 29)
  currentStart.setHours(0, 0, 0, 0)
  
  const previousEnd = new Date(currentStart)
  previousEnd.setDate(previousEnd.getDate() - 1)
  previousEnd.setHours(23, 59, 59, 999)
  const previousStart = new Date(previousEnd)
  previousStart.setDate(previousStart.getDate() - 29)
  previousStart.setHours(0, 0, 0, 0)

  return {
    currentStart: currentStart.toISOString(),
    currentEnd: currentEnd.toISOString(),
    lastStart: previousStart.toISOString(),
    lastEnd: previousEnd.toISOString(),
    periodLabel: 'from last 30 days',
    hasFilter: false,
  }
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Please log in to view analytics</p>
      </div>
    )
  }

  const dateRanges = getDateRanges(params)

  // Build query for current period
  let currentQuery = supabase
    .from('orders')
    .select(`
      *,
      customers (id, name),
      order_items (
        *,
        products (id, name, category)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (dateRanges.hasFilter) {
    currentQuery = currentQuery
      .gte('created_at', dateRanges.currentStart)
      .lte('created_at', dateRanges.currentEnd)
  }

  const { data: currentOrders, error } = await currentQuery

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Error loading analytics data</p>
      </div>
    )
  }

  // Build query for previous period
  let previousQuery = supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)

  if (dateRanges.hasFilter) {
    previousQuery = previousQuery
      .gte('created_at', dateRanges.lastStart)
      .lte('created_at', dateRanges.lastEnd)
  } else {
    previousQuery = previousQuery
      .gte('created_at', dateRanges.lastStart)
      .lte('created_at', dateRanges.lastEnd)
  }

  const { data: previousOrders } = await previousQuery

  // Calculate current period metrics
  const currentRevenue = currentOrders?.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0
  const currentProfit = currentOrders?.reduce((sum, o) => sum + parseFloat(o.profit || 0), 0) || 0
  const currentOrderCount = currentOrders?.length || 0
  const currentAvgOrderValue = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0
  const profitMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0
  const pendingOrdersValue = currentOrders?.filter(o => o.status === 'pending').reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0

  // Calculate previous period metrics
  const previousRevenue = previousOrders?.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0
  const previousProfit = previousOrders?.reduce((sum, o) => sum + parseFloat(o.profit || 0), 0) || 0
  const previousOrderCount = previousOrders?.length || 0
  const previousAvgOrderValue = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0
  const previousProfitMargin = previousRevenue > 0 ? (previousProfit / previousRevenue) * 100 : 0

  // Calculate changes
  const revenueChange = calculatePercentageChange(currentRevenue, previousRevenue)
  const profitChange = calculatePercentageChange(currentProfit, previousProfit)
  const orderCountChange = `${currentOrderCount - previousOrderCount >= 0 ? '+' : ''}${currentOrderCount - previousOrderCount}`
  const avgOrderValueChange = calculatePercentageChange(currentAvgOrderValue, previousAvgOrderValue)
  const profitMarginChange = calculatePercentageChange(profitMargin, previousProfitMargin)

  // Calculate top selling products
  const productSales: Record<string, { name: string; revenue: number; quantity: number }> = {}
  
  currentOrders?.forEach(order => {
    order.order_items?.forEach((item: any) => {
      const productId = item.product_id
      const productName = item.products?.name || item.product_name || 'Unknown Product'
      const revenue = parseFloat(item.subtotal || 0)
      const quantity = item.quantity || 0

      if (!productSales[productId]) {
        productSales[productId] = { name: productName, revenue: 0, quantity: 0 }
      }
      productSales[productId].revenue += revenue
      productSales[productId].quantity += quantity
    })
  })

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const maxProductRevenue = topProducts[0]?.revenue || 1

  // Calculate top customers
  const customerSpending: Record<string, { name: string; spending: number; orderCount: number }> = {}

  currentOrders?.forEach(order => {
    const customerId = order.customer_id
    const customerName = order.customers?.name || 'Unknown Customer'
    const spending = parseFloat(order.total_amount || 0)

    if (!customerSpending[customerId]) {
      customerSpending[customerId] = { name: customerName, spending: 0, orderCount: 0 }
    }
    customerSpending[customerId].spending += spending
    customerSpending[customerId].orderCount += 1
  })

  const topCustomers = Object.values(customerSpending)
    .sort((a, b) => b.spending - a.spending)
    .slice(0, 5)

  const maxCustomerSpending = topCustomers[0]?.spending || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            {dateRanges.hasFilter 
              ? `Showing data from ${format(new Date(params.from!), 'MMM dd, yyyy')} to ${format(new Date(params.to!), 'MMM dd, yyyy')}`
              : 'Showing all time data'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton 
            orders={currentOrders || []} 
            dateRange={params}
          />
          <DateRangePicker />
        </div>
      </div>

      {/* Key Metrics - 6 Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Revenue"
          value={`₹${currentRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          change={`${revenueChange} ${dateRanges.periodLabel}`}
          icon={DollarSign}
          trend={currentRevenue >= previousRevenue ? 'up' : 'down'}
        />
        <StatsCard
          title="Total Profit"
          value={`₹${currentProfit.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          change={`${profitChange} ${dateRanges.periodLabel}`}
          icon={TrendingUp}
          trend={currentProfit >= previousProfit ? 'up' : 'down'}
        />
        <StatsCard
          title="Profit Margin"
          value={`${profitMargin.toFixed(1)}%`}
          change={`${profitMarginChange} ${dateRanges.periodLabel}`}
          icon={Percent}
          trend={profitMargin >= previousProfitMargin ? 'up' : 'down'}
        />
        <StatsCard
          title="Total Orders"
          value={currentOrderCount.toString()}
          change={`${orderCountChange} ${dateRanges.periodLabel}`}
          icon={ShoppingCart}
          trend={currentOrderCount >= previousOrderCount ? 'up' : 'down'}
        />
        <StatsCard
          title="Avg. Order Value"
          value={`₹${currentAvgOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          change={`${avgOrderValueChange} ${dateRanges.periodLabel}`}
          trend={currentAvgOrderValue >= previousAvgOrderValue ? 'up' : 'down'}
          icon={Users}
        />
        <StatsCard
          title="Pending Orders Value"
          value={`₹${pendingOrdersValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          change={`${currentOrders?.filter(o => o.status === 'pending').length || 0} orders`}
          icon={Clock}
          trend="neutral"
        />
      </div>

      {/* Charts Grid - 4 Charts in 2 rows */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales & Profit Trend</CardTitle>
            <CardDescription>
              {dateRanges.hasFilter 
                ? 'Daily performance over the selected period' 
                : 'Performance over last 30 days'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[500px]">
              <SalesProfitChart 
                orders={currentOrders || []} 
                dateRange={{ 
                  from: dateRanges.currentStart, 
                  to: dateRanges.currentEnd 
                }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>
              {dateRanges.hasFilter 
                ? 'Top 10 categories in selected period' 
                : 'All time top 10 categories'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[500px]">
              <RevenueByCategoryChart orders={currentOrders || []} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status Breakdown</CardTitle>
            <CardDescription>
              Distribution of payment statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentStatusChart orders={currentOrders || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Fulfillment Status</CardTitle>
            <CardDescription>
              Current order processing pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrderStatusChart orders={currentOrders || []} />
          </CardContent>
        </Card>
      </div>

      {/* Top Performers Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TopPerformersCard
          title="Top Selling Products"
          description={dateRanges.hasFilter ? 'Best performers in selected period' : 'All time best performers'}
          icon={Package}
          items={topProducts.length > 0 ? topProducts.map(p => ({
            name: p.name,
            value: `₹${p.revenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} (${p.quantity} sold)`,
            progress: Math.round((p.revenue / maxProductRevenue) * 100)
          })) : [{ name: 'No data available', value: '₹0', progress: 0 }]}
          viewAllHref="/products"
        />

        <TopPerformersCard
          title="Top Customers"
          description={dateRanges.hasFilter ? 'Top spenders in selected period' : 'All time top spenders'}
          icon={User}
          items={topCustomers.length > 0 ? topCustomers.map(c => ({
            name: c.name,
            value: `₹${c.spending.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} (${c.orderCount} orders)`,
            progress: Math.round((c.spending / maxCustomerSpending) * 100)
          })) : [{ name: 'No data available', value: '₹0', progress: 0 }]}
          viewAllHref="/customers"
        />
      </div>
    </div>
  )
}

function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  trend = 'up',
}: {
  title: string
  value: string
  change: string
  icon: any
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={`text-xs ${
            trend === 'up' 
              ? 'text-green-600' 
              : trend === 'down' 
              ? 'text-red-600' 
              : 'text-muted-foreground'
          }`}
        >
          {change}
        </p>
      </CardContent>
    </Card>
  )
}

function TopPerformersCard({
  title,
  description,
  icon: Icon,
  items,
  viewAllHref,
}: {
  title: string
  description: string
  icon: any
  items: { name: string; value: string; progress: number }[]
  viewAllHref: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={`${item.name}-${index}`}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium truncate mr-2">{item.name}</span>
              <span className="text-muted-foreground text-xs whitespace-nowrap">{item.value}</span>
            </div>
            <Progress value={item.progress} />
          </div>
        ))}
        <Button variant="ghost" size="sm" className="w-full" asChild>
          <Link href={viewAllHref}>
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}