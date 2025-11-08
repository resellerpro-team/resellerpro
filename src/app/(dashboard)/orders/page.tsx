export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { OrdersClient } from './OrdersClient'

export default async function OrdersPage(props: {
  searchParams: Promise<{ search?: string; status?: string; sort?: string; payment?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  // Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return <div>Please log in</div>
  }

  // Start base query
  let query = supabase
    .from('orders')
    .select(
      `
      *,
      customers (
        id,
        name,
        phone
      )
    `
    )
    .eq('user_id', user.id)

  // =============================
  // 🔍 Full Search Logic (with smarter detection)
  // =============================
  if (searchParams.search) {
    const rawSearch = searchParams.search.trim()
    if (rawSearch) {
      const searchTerm = rawSearch.toLowerCase()
      const term = `%${searchTerm}%`

      // Determine the type of search
      const isOrderNumber = searchTerm.startsWith('#')
      const isPhoneNumber = /^[+]?(91)?\d{10}$/.test(searchTerm.replace(/\s+/g, ''))
      const isName = !isOrderNumber && !isPhoneNumber

      if (isOrderNumber) {
        // ------------------------------
        // 🧾 Search by Order Number
        // ------------------------------
        const numericPart = searchTerm.replace('#', '').replace('%23', '').trim()

        // if it's numeric, use eq (exact match)
        if (/^\d+$/.test(numericPart)) {
          query = query.eq('order_number', Number(numericPart))
        } else {
          // fallback for weird input
          query = query.ilike('order_number_text', `%${numericPart}%`)
        }
      } else if (isPhoneNumber) {
        // ------------------------------
        // 📞 Search by Phone Number (handle +91 / 91 / no prefix)
        // ------------------------------
        const cleanPhone = searchTerm.replace('+91', '').replace('91', '').slice(-10)

        const { data: matchedCustomers, error: phoneError } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id)
          .or(`phone.ilike.%${cleanPhone}%`)

        if (phoneError) console.error('Phone search error:', phoneError)

        const matchedIds = matchedCustomers?.map((c) => c.id) || []
        if (matchedIds.length > 0) {
          query = query.in('customer_id', matchedIds)
        } else {
          // fallback: no match
          query = query.eq('id', '00000000-0000-0000-0000-000000000000') // empty result
        }
      } else if (isName) {
        // ------------------------------
        // 👤 Search by Customer Name
        // ------------------------------
        const { data: matchedCustomers, error: nameError } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id)
          .ilike('name', term)

        if (nameError) console.error('Name search error:', nameError)

        const matchedIds = matchedCustomers?.map((c) => c.id) || []
        if (matchedIds.length > 0) {
          query = query.in('customer_id', matchedIds)
        } else {
          // fallback: no match
          query = query.eq('id', '00000000-0000-0000-0000-000000000000')
        }
      }
    }
  }

  // =============================
  // 🏷️ Filter: Status
  // =============================
  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  // 💳 Filter: Payment
  if (searchParams.payment && searchParams.payment !== 'all') {
    query = query.eq('payment_status', searchParams.payment)
  }

  // =============================
  // ↕ Sorting
  // =============================
  const sortBy = searchParams.sort || '-created_at'
  const sortOrder = sortBy.startsWith('-')
  const sortField = sortBy.replace('-', '')
  query = query.order(sortField, { ascending: !sortOrder })

  // =============================
  // 🧾 Fetch Data
  // =============================
  const { data: orders, error } = await query
  if (error) {
    console.error('Error fetching orders:', error)
    return <div>Error loading orders</div>
  }

  // =============================
  // 📊 Stats Calculation
  // =============================
  const totalOrders = orders?.length || 0
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
  const totalProfit = orders?.reduce((sum, o) => sum + (o.total_profit || 0), 0) || 0
  const pendingOrders = orders?.filter((o) => o.status === 'pending').length || 0
  const completedOrders = orders?.filter((o) => o.status === 'completed').length || 0

  const stats = {
    totalOrders,
    totalRevenue,
    totalProfit,
    pendingOrders,
    completedOrders,
  }

  // Extract unique statuses & payment methods
  const statuses = [...new Set(orders?.map((o) => o.status).filter(Boolean))] as string[]
  const payments = [...new Set(orders?.map((o) => o.payment_status).filter(Boolean))] as string[]

  // =============================
  // 🧭 Return UI Client Component
  // =============================
  return (
    <OrdersClient
      initialOrders={orders || []}
      stats={stats}
      statuses={statuses}
      payments={payments}
      currentSort={sortBy}
      currentStatus={searchParams.status || 'all'}
      currentPayment={searchParams.payment || 'all'}
      currentSearch={searchParams.search || ''}
    />
  )
}
