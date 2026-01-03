import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import {
  getDashboardStats,
  getRevenueChartData,
  getRecentOrders,
  getTopProducts,
  getDashboardAlerts,
  getEnquiries,
} from './action'
import { EnquiriesCard } from '@/components/dashboard/EnquiriesCard'

export const metadata = {
  title: 'Dashboard - ResellerPro',
  description: 'Your business overview',
}

export default async function DashboardPage() {
  // Fetch all data in parallel for better performance
  const [stats, revenueData, recentOrders, topProducts, alerts, enquiries] = await Promise.all([
    getDashboardStats(),
    getRevenueChartData(),
    getRecentOrders(),
    getTopProducts(),
    getDashboardAlerts(),
    getEnquiries(),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Enquiries Section */}
      <section>
        <EnquiriesCard enquiries={enquiries} />
      </section>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <StatsCard
          title="Today's Revenue"
          value={`₹${stats?.todayRevenue.toLocaleString('en-IN') || 0}`}
          change={`${stats?.revenueChange && stats.revenueChange > 0 ? '+' : ''}${stats?.revenueChange || 0}%`}
          trend={stats?.revenueChange && stats.revenueChange >= 0 ? 'up' : 'down'}
          icon={DollarSign}
        />
        <StatsCard
          title="Today's Profit"
          value={`₹${stats?.todayProfit.toLocaleString('en-IN') || 0}`}
          change={`${stats?.profitChange && stats.profitChange > 0 ? '+' : ''}${stats?.profitChange || 0}%`}
          trend={stats?.profitChange && stats.profitChange >= 0 ? 'up' : 'down'}
          icon={TrendingUp}
        />
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button className="justify-start" asChild>
              <Link href="/orders/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New Order
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/customers/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
            <CardDescription>Important updates for your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.pendingOrders > 0 && (
              <AlertItem
                type="warning"
                message={`${alerts.pendingOrders} order${alerts.pendingOrders > 1 ? 's' : ''} pending - need your attention`}
                action="View Orders"
                href="/orders?status=pending"
              />
            )}
            {alerts.lowStockProducts > 0 && (
              <AlertItem
                type="info"
                message={`${alerts.lowStockProducts} product${alerts.lowStockProducts > 1 ? 's' : ''} running low on stock`}
                action="Manage Stock"
                href="/products"
              />
            )}
            <AlertItem
              type="success"
              message={
                alerts.monthlyRevenue >= alerts.monthlyTarget
                  ? `Congratulations! You've hit your ₹${alerts.monthlyTarget.toLocaleString('en-IN')} target!`
                  : `You're on track to hit ₹${alerts.monthlyTarget.toLocaleString('en-IN')} this month!`
              }
              action="View Analytics"
              href="/analytics"
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4 h-full">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Your revenue for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            <div className="flex items-start justify-start w-full h-full rounded-lg">
              <div className="text-muted-foreground w-full h-full">
                <RevenueChart data={revenueData} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 5 orders from customers</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <RecentOrderItem
                    key={order.id}
                    customer={order.customer}
                    amount={`₹${order.amount.toLocaleString('en-IN')}`}
                    product={order.product}
                    time={order.time}
                    status={order.status}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No orders yet</p>
                <p className="text-sm">Create your first order to get started</p>
              </div>
            )}
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link href="/orders">
                View All Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>



      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Best performers this month</CardDescription>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product) => (
                <TopProductItem
                  key={product.id}
                  name={product.name}
                  sold={product.sold}
                  revenue={`₹${product.revenue.toLocaleString('en-IN')}`}
                  profit={`₹${product.profit.toLocaleString('en-IN')}`}
                  trend={product.trend}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No product sales yet</p>
              <p className="text-sm">Add products and create orders to see top sellers</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
}: {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: any
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
            {change}
          </span>
          <span>from yesterday</span>
        </p>
      </CardContent>
    </Card>
  )
}

function RecentOrderItem({
  customer,
  amount,
  product,
  time,
  status,
}: {
  customer: string
  amount: string
  product: string
  time: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
}) {
  const statusConfig = {
    pending: { color: 'bg-yellow-500', label: 'Pending' },
    processing: { color: 'bg-blue-500', label: 'Processing' },
    shipped: { color: 'bg-purple-500', label: 'Shipped' },
    delivered: { color: 'bg-green-500', label: 'Delivered' },
    cancelled: { color: 'bg-red-500', label: 'Cancelled' },
  }

  return (
    <div className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
      <div className={`h-2 w-2 rounded-full mt-2 ${statusConfig[status].color}`} />
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium">{customer}</p>
            <p className="text-xs text-muted-foreground">{product}</p>
          </div>
          <p className="text-sm font-semibold">{amount}</p>
        </div>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}

function AlertItem({
  type,
  message,
  action,
  href,
}: {
  type: 'warning' | 'info' | 'success'
  message: string
  action: string
  href: string
}) {
  const config = {
    warning: { icon: AlertCircle, color: 'text-yellow-500' },
    info: { icon: AlertCircle, color: 'text-blue-500' },
    success: { icon: CheckCircle2, color: 'text-green-500' },
  }

  const Icon = config[type].icon

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      <Icon className={`h-5 w-5 mt-0.5 ${config[type].color}`} />
      <div className="flex-1">
        <p className="text-sm">{message}</p>
        <Button variant="link" size="sm" className="h-auto p-0 mt-1" asChild>
          <Link href={href}>{action}</Link>
        </Button>
      </div>
    </div>
  )
}

function TopProductItem({
  name,
  sold,
  revenue,
  profit,
  trend,
}: {
  name: string
  sold: number
  revenue: string
  profit: string
  trend: 'up' | 'down'
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{name}</p>
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{sold} sold</span>
          <span>Revenue: {revenue}</span>
          <span className="text-green-600 font-medium">Profit: {profit}</span>
        </div>
      </div>
    </div>
  )
}