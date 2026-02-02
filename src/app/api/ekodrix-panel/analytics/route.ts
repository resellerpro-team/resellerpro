import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyEkodrixAuth } from '@/lib/ekodrix-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        await verifyEkodrixAuth()
        const supabase = await createAdminClient()

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        // 1. Revenue - payment_transactions has created_at
        const { data: revenueData } = await supabase
            .from('payment_transactions')
            .select('amount, created_at')
            .eq('status', 'success')
            .gte('created_at', thirtyDaysAgo.toISOString())

        // 2. User Growth - profiles ONLY HAS updated_at
        const { data: userData } = await supabase
            .from('profiles')
            .select('updated_at')
            .gte('updated_at', thirtyDaysAgo.toISOString())

        // 3. Plan Distribution - user_subscriptions join
        // Using explicit join to avoid identifier errors
        const { data: subData } = await supabase
            .from('user_subscriptions')
            .select(`
                status,
                plan:subscription_plans(name)
            `)
            .eq('status', 'active')

        // Aggregations
        const revenueByDay: Record<string, number> = {}
        const usersByDay: Record<string, number> = {}

        revenueData?.forEach(tx => {
            try {
                const day = new Date(tx.created_at).toISOString().split('T')[0]
                revenueByDay[day] = (revenueByDay[day] || 0) + (tx.amount || 0)
            } catch (e) { }
        })

        userData?.forEach(u => {
            try {
                const day = new Date(u.updated_at).toISOString().split('T')[0]
                usersByDay[day] = (usersByDay[day] || 0) + 1
            } catch (e) { }
        })

        const planDistribution: Record<string, number> = {}
        subData?.forEach((s: any) => {
            const planName = s.plan?.name || 'Free'
            planDistribution[planName] = (planDistribution[planName] || 0) + 1
        })

        return NextResponse.json({
            success: true,
            data: {
                revenueTrend: revenueByDay,
                userTrend: usersByDay,
                planDistribution,
                metrics: {
                    periodRevenue: revenueData?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0,
                    periodNewUsers: userData?.length || 0,
                    activeSubs: subData?.length || 0
                }
            }
        })
    } catch (error: any) {
        console.error('Ekodrix analytics API error:', error)
        return NextResponse.json(
            { success: false, error: 'Analytics Diagnostic Failed' },
            { status: 500 }
        )
    }
}
