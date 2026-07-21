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
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const payment = searchParams.get('payment')
    const sort = searchParams.get('sort')

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

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
    `,
            { count: 'exact' }
        )
        .eq('user_id', user.id)

    // =============================
    // 🔍 Full Search Logic
    // =============================
    if (search) {
        const rawSearch = search.trim()
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
                    // Match either linked customer_id OR guest order phone number
                    query = query.or(`customer_id.in.(${matchedIds.join(',')}),customer_phone.ilike.%${cleanPhone}%`)
                } else {
                    // Search in guest customer phone directly
                    query = query.ilike('customer_phone', `%${cleanPhone}%`)
                }
            } else if (isName) {
                // ------------------------------
                // 👤 Search by Customer Name
                // ------------------------------
                const sanitizedTerm = term.replace(/,/g, '')
                const { data: matchedCustomers, error: nameError } = await supabase
                    .from('customers')
                    .select('id')
                    .eq('user_id', user.id)
                    .ilike('name', sanitizedTerm)

                if (nameError) console.error('Name search error:', nameError)

                const matchedIds = matchedCustomers?.map((c) => c.id) || []
                if (matchedIds.length > 0) {
                    // Match either linked customer_id OR guest order customer_name
                    query = query.or(`customer_id.in.(${matchedIds.join(',')}),customer_name.ilike.${sanitizedTerm}`)
                } else {
                    // Search in guest customer name directly
                    query = query.ilike('customer_name', sanitizedTerm)
                }
            }
        }
    }

    // =============================
    // 🏷️ Filter: Status
    // =============================
    if (status && status !== 'all') {
        query = query.eq('status', status)
    }

    // 💳 Filter: Payment
    if (payment && payment !== 'all') {
        query = query.eq('payment_status', payment)
    }

    // =============================
    // ↕ Sorting
    // =============================
    const sortBy = sort || '-created_at'
    const sortOrder = sortBy.startsWith('-')
    const sortField = sortBy.replace('-', '')
    query = query.order(sortField, { ascending: !sortOrder })

    // Pagination Range
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
        data,
        total: count,
        page,
        limit
    })
}
