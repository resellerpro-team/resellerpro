'use server'

import { createClient } from '@/lib/supabase/server'

// ========================================================
// Type Definitions
// ========================================================

export type DashboardStats = {
  todayRevenue: number
  todayProfit: number
  todayOrders: number
  totalCustomers: number
  revenueChange: number
  profitChange: number
  ordersChange: number
  customersChange: number
}

export type RevenueData = {
  day: string
  revenue: number
}

export type RecentOrder = {
  id: string
  customer: string
  amount: number
  product: string
  time: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
}

export type TopProduct = {
  id: string
  name: string
  sold: number
  revenue: number
  profit: number
  trend: 'up' | 'down'
}

export type DashboardAlerts = {
  pendingOrders: number
  lowStockProducts: number
  monthlyRevenue: number
  monthlyTarget: number
}

export type Enquiry = {
  id: string
  customerName: string
  message: string
  date: string
  status: 'new' | 'read' | 'replied'
}

// Internal types for database responses
type OrderBasic = {
  total_amount: number
  total_profit: number
}

type OrderItem = {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  unit_cost: number
}

type OrderWithItems = {
  id: string
  total_amount: number
  created_at: string
  status: string
  customers: {
    name: string
  } | null
  order_items: {
    product_name: string
    quantity: number
  }[]
}

type OrderWithItemsForProducts = {
  id: string
  created_at: string
  order_items: OrderItem[]
}

type OrderItemForTrend = {
  product_id: string
  quantity: number
}

type OrderForTrend = {
  order_items: OrderItemForTrend[]
}

// ========================================================
// Data Fetching Functions
// ========================================================

/**
 * Fetches dashboard statistics comparing today vs yesterday
 */
export async function getDashboardStats(): Promise<DashboardStats | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  try {
    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString()
    const todayEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString()

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString()
    const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString()

    // Fetch today's orders
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('total_amount, total_profit')
      .eq('user_id', user.id)
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd)
      .returns<OrderBasic[]>()

    // Fetch yesterday's orders
    const { data: yesterdayOrders } = await supabase
      .from('orders')
      .select('total_amount, total_profit')
      .eq('user_id', user.id)
      .gte('created_at', yesterdayStart)
      .lte('created_at', yesterdayEnd)
      .returns<OrderBasic[]>()

    // Calculate today's stats
    const todayRevenue = todayOrders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0
    const todayProfit = todayOrders?.reduce((sum, order) => sum + Number(order.total_profit || 0), 0) || 0
    const todayOrdersCount = todayOrders?.length || 0

    // Calculate yesterday's stats
    const yesterdayRevenue = yesterdayOrders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0
    const yesterdayProfit = yesterdayOrders?.reduce((sum, order) => sum + Number(order.total_profit || 0), 0) || 0
    const yesterdayOrdersCount = yesterdayOrders?.length || 0

    // Calculate percentage changes
    const revenueChange = yesterdayRevenue > 0
      ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
      : todayRevenue > 0 ? 100 : 0

    const profitChange = yesterdayProfit > 0
      ? Math.round(((todayProfit - yesterdayProfit) / yesterdayProfit) * 100)
      : todayProfit > 0 ? 100 : 0

    const ordersChange = todayOrdersCount - yesterdayOrdersCount

    // Fetch total customers
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Fetch customers created before today
    const { count: yesterdayCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .lt('created_at', todayStart)

    const customersChange = (totalCustomers || 0) - (yesterdayCustomers || 0)

    return {
      todayRevenue: Math.round(todayRevenue),
      todayProfit: Math.round(todayProfit),
      todayOrders: todayOrdersCount,
      totalCustomers: totalCustomers || 0,
      revenueChange,
      profitChange,
      ordersChange,
      customersChange,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Error fetching dashboard stats:', errorMessage)
    return null
  }
}

/**
 * Fetches revenue data for the last 7 days for the chart
 */
export async function getRevenueChartData(): Promise<RevenueData[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const today = new Date()
    const last7Days: RevenueData[] = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).toISOString()
      const dayEnd = new Date(date.setHours(23, 59, 59, 999)).toISOString()

      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('user_id', user.id)
        .gte('created_at', dayStart)
        .lte('created_at', dayEnd)
        .returns<{ total_amount: number }[]>()

      const revenue = orders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0

      last7Days.push({
        day: days[date.getDay()],
        revenue: Math.round(revenue),
      })
    }

    return last7Days
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Error fetching revenue chart data:', errorMessage)
    return []
  }
}

/**
 * Fetches the 5 most recent orders
 */
export async function getRecentOrders(): Promise<RecentOrder[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        created_at,
        status,
        customers (name),
        order_items (product_name, quantity)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .returns<OrderWithItems[]>()

    if (!orders) return []

    return orders.map(order => {
      // Get first product or show count if multiple
      const items = order.order_items || []
      const firstProduct = items[0]?.product_name || 'Unknown Product'
      const productDisplay = items.length > 1
        ? `${firstProduct} × ${items.length}`
        : firstProduct

      // Calculate time ago
      const createdAt = new Date(order.created_at)
      const now = new Date()
      const diffMs = now.getTime() - createdAt.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      let timeAgo = ''
      if (diffMins < 1) {
        timeAgo = 'Just now'
      } else if (diffMins < 60) {
        timeAgo = `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
      } else {
        timeAgo = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
      }

      const orderStatus = order.status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

      return {
        id: order.id,
        customer: order.customers?.name || 'Unknown Customer',
        amount: Number(order.total_amount || 0),
        product: productDisplay,
        time: timeAgo,
        status: orderStatus || 'pending',
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Error fetching recent orders:', errorMessage)
    return []
  }
}

/**
 * Fetches top 4 selling products for the current month
 */
export async function getTopProducts(): Promise<TopProduct[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    // Get current month date range
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Get last month date range for trend comparison
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

    // Fetch current month's order IDs first
    const { data: currentMonthOrders, error: currentOrdersError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', monthStart)

    if (currentOrdersError) {
      console.error('Error fetching current month orders:', currentOrdersError)
      return []
    }

    if (!currentMonthOrders || currentMonthOrders.length === 0) {
      return []
    }

    const currentOrderIds = currentMonthOrders.map(o => o.id)

    // Fetch order items for current month - SELECT ALL COLUMNS to see what exists
    const { data: currentItems, error: currentItemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', currentOrderIds)

    if (currentItemsError) {
      console.error('Error fetching current month items:', currentItemsError)
      return []
    }

    // Fetch last month's order IDs
    const { data: lastMonthOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', lastMonthStart)
      .lte('created_at', lastMonthEnd)

    let lastMonthItems: { product_id: string; quantity: number }[] = []

    if (lastMonthOrders && lastMonthOrders.length > 0) {
      const lastOrderIds = lastMonthOrders.map(o => o.id)
      const { data: items } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .in('order_id', lastOrderIds)

      lastMonthItems = items || []
    }

    if (!currentItems || currentItems.length === 0) {
      return []
    }

    // Aggregate data by product
    const productMap = new Map<string, {
      id: string
      name: string
      sold: number
      revenue: number
      profit: number
      lastMonthSold: number
    }>()

    // Process current month data
    currentItems.forEach((item) => {
      if (!item.product_id) return

      const existing = productMap.get(item.product_id) || {
        id: item.product_id,
        name: item.product_name || 'Unknown Product',
        sold: 0,
        revenue: 0,
        profit: 0,
        lastMonthSold: 0,
      }

      const quantity = item.quantity || 0
      const unitPrice = Number(item.unit_selling_price || 0)
      const unitCost = Number(item.unit_cost_price || 0)

      existing.sold += quantity
      existing.revenue += quantity * unitPrice
      existing.profit += quantity * (unitPrice - unitCost)

      productMap.set(item.product_id, existing)
    })

    // Add last month data for trend calculation
    lastMonthItems.forEach((item) => {
      if (!item.product_id) return

      const existing = productMap.get(item.product_id)
      if (existing) {
        existing.lastMonthSold += item.quantity || 0
      }
    })

    // Convert to array, sort by revenue, and take top 4
    const products = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4)
      .map(product => {
        const trend: 'up' | 'down' = product.sold >= product.lastMonthSold ? 'up' : 'down'

        return {
          id: product.id,
          name: product.name,
          sold: product.sold,
          revenue: Math.round(product.revenue),
          profit: Math.round(product.profit),
          trend,
        }
      })

    return products
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Error fetching top products:', errorMessage)
    return []
  }
}

/**
 * Fetches alert data for the dashboard
 */
export async function getDashboardAlerts(): Promise<DashboardAlerts> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      pendingOrders: 0,
      lowStockProducts: 0,
      monthlyRevenue: 0,
      monthlyTarget: 50000,
    }
  }

  try {
    // Count pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'pending')

    // Count low stock products
    const { count: lowStockProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('stock_status', 'low_stock')

    // Calculate monthly revenue
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { data: monthlyOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('user_id', user.id)
      .gte('created_at', monthStart)
      .returns<{ total_amount: number }[]>()

    const monthlyRevenue = monthlyOrders?.reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    ) || 0

    return {
      pendingOrders: pendingOrders || 0,
      lowStockProducts: lowStockProducts || 0,
      monthlyRevenue: Math.round(monthlyRevenue),
      monthlyTarget: 50000, // Can be made dynamic based on user settings
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Error fetching dashboard alerts:', errorMessage)
    return {
      pendingOrders: 0,
      lowStockProducts: 0,
      monthlyRevenue: 0,
      monthlyTarget: 50000,
    }
  }
}

/**
 * Fetches recent enquiries
 */
export async function getEnquiries(): Promise<Enquiry[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    const { data: enquiries } = await supabase
      .from('enquiries')
      .select('id, customer_name, message, created_at, status')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!enquiries) return []

    return enquiries.map(enquiry => {
      // Calculate time ago
      const createdAt = new Date(enquiry.created_at)
      const now = new Date()
      const diffMs = now.getTime() - createdAt.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      let timeAgo = ''
      if (diffMins < 1) {
        timeAgo = 'Just now'
      } else if (diffMins < 60) {
        timeAgo = `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
      } else {
        timeAgo = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
      }

      // Map status loosely to satisfy the type, defaulting 'new' if matches, else cast
      // The DB status might be 'new', 'needs_follow_up', etc.
      // The UI expects 'new', 'read', 'replied'
      let status: 'new' | 'read' | 'replied' = 'read'
      if (enquiry.status === 'new') status = 'new'
      else if (enquiry.status === 'replied' || enquiry.status === 'converted') status = 'replied'

      return {
        id: enquiry.id,
        customerName: enquiry.customer_name || 'Unknown',
        message: enquiry.message || '',
        date: timeAgo,
        status: status
      }
    })
  } catch (error) {
    console.error('Error fetching enquiries:', error)
    return []
  }
}