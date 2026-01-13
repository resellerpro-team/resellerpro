import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const supabase = await createClient()

    // Get logged-in user
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const q = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '5')
    const page = parseInt(searchParams.get('page') || '1')
    const type = searchParams.get('type') || 'all' // all | orders | customers | products

    if (!q || q.length < 2) {
        return NextResponse.json({
            orders: [],
            customers: [],
            products: [],
            total: 0,
        })
    }

    const query = `%${q}%`
    const offset = (page - 1) * limit

    try {
        const results: any = {
            orders: [],
            customers: [],
            products: [],
        }

        // 1. Search Customers
        if (type === 'all' || type === 'customers') {
            const { data: customers, error: customersError } = await supabase
                .from('customers')
                .select('*') // Full data for search page
                .eq('user_id', user.id)
                .eq('is_deleted', false)
                .or(`name.ilike.${query},phone.ilike.${query},email.ilike.${query}`)
                .range(offset, offset + limit - 1)
                .order('name', { ascending: true })

            if (customersError) throw customersError
            results.customers = customers || []
        }

        // 2. Search Products
        if (type === 'all' || type === 'products') {
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('*') // Full data for search page
                .eq('user_id', user.id)
                .or(`name.ilike.${query},sku.ilike.${query}`)
                .range(offset, offset + limit - 1)
                .order('name', { ascending: true })

            if (productsError) throw productsError
            results.products = products || []
        }

        // 3. Search Orders
        if (type === 'all' || type === 'orders') {
            let ordersQuery = supabase
                .from('orders')
                .select(`
          *,
          customers (
            id,
            name,
            phone
          )
        `)
                .eq('user_id', user.id)

            const isNumeric = /^\d+$/.test(q.replace('#', ''))
            if (isNumeric) {
                const num = q.replace('#', '')
                ordersQuery = ordersQuery.or(`order_number.eq.${num}`)
            } else {
                const { data: matchedCustomers } = await supabase
                    .from('customers')
                    .select('id')
                    .eq('user_id', user.id)
                    .ilike('name', query)

                const customerIds = matchedCustomers?.map(c => c.id) || []
                if (customerIds.length > 0) {
                    ordersQuery = ordersQuery.in('customer_id', customerIds)
                } else {
                    ordersQuery = ordersQuery.eq('id', '00000000-0000-0000-0000-000000000000')
                }
            }

            const { data: orders, error: ordersError } = await ordersQuery
                .range(offset, offset + limit - 1)
                .order('created_at', { ascending: false })

            if (ordersError) throw ordersError
            results.orders = orders || []
        }

        return NextResponse.json(results)
    } catch (error: any) {
        console.error('Global search error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
