export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Package, ShoppingCart, TrendingUp, IndianRupee } from 'lucide-react'
import Link from 'next/link'
import { OrdersTable } from '@/components/orders/OrderTable'
import { OrdersFilter } from '@/components/orders/OrderFilters'

type Order = {
  profit: number
  id: string
  order_number: number
  created_at: string
  status: string
  payment_status: string
  total_amount: number
  total_profit: number
  customers?: {
    id: string
    name: string
    phone: string
  } | null
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const resolvedParams = await searchParams
  const statusFilter = resolvedParams.status || 'all'


  // ========================================================
  // Query 1: Fetch ALL orders for stats calculation
  // ========================================================
  const { data: allOrders, error: allOrdersError } = await supabase
    .from('orders')
    .select(`
      *,
      customers (
        id,
        name,
        phone
      )
    `)
    .order('created_at', { ascending: false }) as { data: Order[] | null, error: any }

  if (allOrdersError) {
    console.error('Error fetching all orders:', allOrdersError)
  }

  // ========================================================
  // Query 2: Fetch FILTERED orders for table display
  // ========================================================
  let filteredQuery = supabase
    .from('orders')
    .select(`
      *,
      customers (
        id,
        name,
        phone
      )
    `)

  // Apply status filter at database level
  if (statusFilter && statusFilter !== 'all') {
    filteredQuery = filteredQuery.eq('status', statusFilter)
  }

  const { data: orders, error: ordersError } = await filteredQuery
    .order('created_at', { ascending: false }) as { data: Order[] | null, error: any }

  if (ordersError) {
    console.error('Error fetching filtered orders:', ordersError)
  }


  // ========================================================
  // Calculate stats from ALL orders (unfiltered)
  // ========================================================
  const totalOrders = allOrders?.length || 0
  const totalRevenue =
    allOrders?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0
  const totalProfit =
    allOrders?.reduce((sum, o) => sum + Number(o.profit || 0), 0) || 0
  const pendingOrders =
    allOrders?.filter((o) => o.status === 'pending').length || 0

  return (
    <div className="space-y-6">
      {/* Header Section */}
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

      {/* Stats Cards - Always show total stats */}
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

      {/* Orders Table with Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>
              {statusFilter === 'all' 
                ? 'All Orders' 
                : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Orders`}
            </CardTitle>
            <OrdersFilter />
          </div>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <OrdersTable orders={orders} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 opacity-50 mb-4" />
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm">
                {statusFilter !== 'all' 
                  ? `No ${statusFilter} orders at the moment`
                  : 'Create your first order to get started'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}