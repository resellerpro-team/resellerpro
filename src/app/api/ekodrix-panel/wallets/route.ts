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
            .from('profiles')
            .select('id, full_name, email, wallet_balance, business_name', { count: 'exact' })

        // Apply search if provided
        if (search) {
            const safeSearch = sanitizeSearch(search)
            query = query.or(`full_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%,business_name.ilike.%${safeSearch}%`)
        }

        const { data: wallets, count, error } = await query
            .order('wallet_balance', { ascending: false })
            .order('updated_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) throw error

        // Get total liquidity summary
        const { data: allBalances } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .gt('wallet_balance', 0)

        const totalLiquidity = allBalances?.reduce((sum, p) => sum + (p.wallet_balance || 0), 0) || 0

        return NextResponse.json({
            success: true,
            data: wallets || [],
            summary: {
                totalLiquidity,
                activeWallets: allBalances?.length || 0
            },
            pagination: {
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            }
        })
    } catch (error: any) {
        console.error('Ekodrix wallets error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
