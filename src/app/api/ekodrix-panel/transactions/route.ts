import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createAdminClient()
        const { searchParams } = new URL(request.url)

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = (page - 1) * limit

        const { data: transactions, count, error } = await supabase
            .from('payment_transactions')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) throw error

        // Handle profile mapping if transactions exist
        let formattedTransactions = transactions || []
        if (formattedTransactions.length > 0) {
            const userIds = Array.from(new Set(formattedTransactions.map(t => t.user_id))).filter(Boolean)

            if (userIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .in('id', userIds)

                const profileMap = (profiles || []).reduce((acc: any, p: any) => {
                    acc[p.id] = p
                    return acc
                }, {})

                formattedTransactions = formattedTransactions.map(t => ({
                    ...t,
                    profile: profileMap[t.user_id] || null
                }))
            }
        }

        return NextResponse.json({
            success: true,
            data: formattedTransactions,
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
