export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Package, ShoppingCart, TrendingUp, IndianRupee } from 'lucide-react'
import Link from 'next/link'
import { OrdersTable } from '@/components/orders/OrderTable'
import { OrdersFilter } from '@/components/orders/OrderFilters'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = await createClient()

  // Fetch orders with customer data
  let query = supabase
    .from('orders')
    .select(`
      *,
      customers (
        id,
        name,
        phone
      )
    `)
    .order('created_at', { ascending: false })

  // Apply status filter
  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  const { data: orders, error } = await query

  if (error) {
    console.error('Error fetching orders:', error)
  }

  // Calculate stats
  const totalOrders = orders?.length || 0
  const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0
  const totalProfit = orders?.reduce((sum, o) => sum + parseFloat(o.profit || 0), 0) || 0
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0

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
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalProfit.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Orders</CardTitle>
            <OrdersFilter />
          </div>
        </CardHeader>
        <CardContent>
          <OrdersTable orders={orders || []} />
        </CardContent>
      </Card>
    </div>
  )
}