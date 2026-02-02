import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyEkodrixAuth } from '@/lib/ekodrix-auth'

export const dynamic = 'force-dynamic'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 🔒 SECURITY: Verify admin authentication
        await verifyEkodrixAuth()

        const supabase = await createAdminClient()
        const { id } = params

        // Fetch customer profile
        const { data: customer, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single()

        if (profileErr) throw profileErr

        // Fetch subscription separately
        const { data: sub } = await supabase
            .from('user_subscriptions')
            .select(`
                *,
                plan:subscription_plans (*)
            `)
            .eq('user_id', id)
            .single()

        // Fetch counts separately
        const { count: ordersCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', id)

        const { count: enquiriesCount } = await supabase
            .from('enquiries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', id)

        // Fetch recent activity
        const { data: recentOrders } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: false })
            .limit(5)

        const { data: recentTransactions } = await supabase
            .from('payment_transactions')
            .select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: false })
            .limit(5)

        return NextResponse.json({
            success: true,
            data: {
                ...customer,
                subscription: sub || null,
                orders_count: [{ count: ordersCount || 0 }],
                enquiries_count: [{ count: enquiriesCount || 0 }],
                recentOrders: recentOrders || [],
                recentTransactions: recentTransactions || [],
            }
        })
    } catch (error: any) {
        console.error('Ekodrix customer detail error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

// Admin Action: Manual Subscription Management
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 🔒 SECURITY: Verify admin authentication
        await verifyEkodrixAuth()

        const supabase = await createAdminClient()
        const { id } = params
        const body = await request.json()
        const { action, planId, durationDays } = body

        if (action === 'unlock' || action === 'extend') {
            const now = new Date()
            const expiry = new Date()
            expiry.setDate(expiry.getDate() + (durationDays || 30))

            const { error } = await supabase
                .from('user_subscriptions')
                .update({
                    plan_id: planId,
                    status: 'active',
                    current_period_start: now.toISOString(),
                    current_period_end: expiry.toISOString(),
                    cancel_at_period_end: false,
                })
                .eq('user_id', id)

            if (error) throw error

            return NextResponse.json({ success: true, message: `Subscription ${action}ed successfully` })
        }

        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        console.error('Ekodrix customer action error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
