import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyEkodrixAuth } from '@/lib/ekodrix-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        // 🔒 SECURITY: Verify admin authentication
        await verifyEkodrixAuth()

        const supabase = await createAdminClient()
        const { searchParams } = new URL(request.url)

        const search = searchParams.get('search') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = (page - 1) * limit

        // 🔒 SECURITY: Sanitize search input to prevent SQL injection
        const sanitizeSearch = (input: string): string => {
            return input.replace(/[%_\\'"]/g, '\\$&')
        }

        let query = supabase
            .from('payment_transactions')
            .select(`
                *,
                profile:profiles(full_name, email)
            `, { count: 'exact' })

        // Apply search if provided
        if (search) {
            const safeSearch = sanitizeSearch(search)

            // Search IDs or Payment references
            let subQuery = `razorpay_order_id.ilike.%${safeSearch}%,razorpay_payment_id.ilike.%${safeSearch}%`

            // Also search by profile email/name
            const { data: profileIds } = await supabase
                .from('profiles')
                .select('id')
                .or(`full_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`)

            if (profileIds && profileIds.length > 0) {
                const ids = profileIds.map(p => p.id)
                subQuery += `,user_id.in.(${ids.map(id => `"${id}"`).join(',')})`
            }

            query = query.or(subQuery)
        }

        const { data: transactions, count, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) throw error

        // Revenue Summary (Successful only)
        const { data: successfulTx } = await supabase
            .from('payment_transactions')
            .select('amount')
            .eq('status', 'success')

        const totalRevenue = successfulTx?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0

        return NextResponse.json({
            success: true,
            data: transactions || [],
            summary: {
                totalVolume: count || 0,
                successRevenue: totalRevenue,
                successCount: successfulTx?.length || 0
            },
            pagination: {
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            }
        })
    } catch (error: any) {
        console.error('Ekodrix transactions error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
