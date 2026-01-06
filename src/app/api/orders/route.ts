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

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
