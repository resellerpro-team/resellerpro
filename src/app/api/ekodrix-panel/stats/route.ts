import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createAdminClient()

        // Get total users count
        const { count: totalUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        // Get active subscriptions count
        const { count: activeSubscriptions } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .neq('plan_id', (await supabase.from('subscription_plans').select('id').eq('name', 'free').single()).data?.id)
            .eq('status', 'active')

        // Get total revenue from successful transactions
        const { data: revenueData } = await supabase
            .from('payment_transactions')
            .select('amount')
            .eq('status', 'success')

        const totalRevenue = revenueData?.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0

        // Get today's new users
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const { count: newUsersToday } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('updated_at', today.toISOString())

        // Get this month's revenue
        const monthStart = new Date()
        monthStart.setDate(1)
        monthStart.setHours(0, 0, 0, 0)
        const { data: monthRevenueData } = await supabase
            .from('payment_transactions')
            .select('amount')
            .eq('status', 'success')
            .gte('created_at', monthStart.toISOString())

        const monthRevenue = monthRevenueData?.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0

        // Get expiring subscriptions (next 7 days)
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        const { count: expiringCount } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .lte('current_period_end', nextWeek.toISOString())
            .gte('current_period_end', new Date().toISOString())

        // Get total orders
        const { count: totalOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })

        // Get pending enquiries
        const { count: pendingEnquiries } = await supabase
            .from('enquiries')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'new')

        // Get recent activity (last 10 users)
        const { data: recentUsers } = await supabase
            .from('profiles')
            .select('id, full_name, email, updated_at')
            .order('updated_at', { ascending: false })
            .limit(10)

        // Get recent transactions
        const { data: recentTransactions } = await supabase
            .from('payment_transactions')
            .select('id, amount, status, created_at, user_id')
            .order('created_at', { ascending: false })
            .limit(10)

        // Get plan distribution
        const { data: planDistribution } = await supabase
            .from('user_subscriptions')
            .select('plan:subscription_plans(name, display_name)')
            .eq('status', 'active')

        const planCounts: Record<string, number> = {}
        planDistribution?.forEach((sub: any) => {
            const planName = sub.plan?.display_name || 'Unknown'
            planCounts[planName] = (planCounts[planName] || 0) + 1
        })

        // Get Active Users (activity in last 24h from usage_tracking)
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const { count: activeUsersHighlights } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('updated_at', dayAgo.toISOString())

        // Get Average Daily Use Time (simulated from usage_tracking counts)
        const { data: usageData } = await supabase
            .from('usage_tracking')
            .select('count')
            .gte('created_at', dayAgo.toISOString())

        const totalUsage = usageData?.reduce((sum, u) => sum + (u.count || 0), 0) || 0
        const avgUseTime = totalUsage > 0 ? Math.round(totalUsage / (totalUsers || 1) * 2) : 0 // heuristic

        // Get Free vs Pro breakdown
        const { count: freeUsers } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('plan_id', (await supabase.from('subscription_plans').select('id').eq('name', 'free').single()).data?.id)

        const { count: proUsers } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .neq('plan_id', (await supabase.from('subscription_plans').select('id').eq('name', 'free').single()).data?.id)

        return NextResponse.json({
            success: true,
            data: {
                metrics: {
                    totalUsers: totalUsers || 0,
                    activeSubscriptions: activeSubscriptions || 0,
                    activeUsersHighlights: activeUsersHighlights || 0,
                    avgUseTime,
                    freeUsers: freeUsers || 0,
                    proUsers: proUsers || 0,
                    totalRevenue,
                    monthRevenue,
                    newUsersToday: newUsersToday || 0,
                    expiringCount: expiringCount || 0,
                    totalOrders: totalOrders || 0,
                    pendingEnquiries: pendingEnquiries || 0,
                },
                recentUsers: recentUsers || [],
                recentTransactions: recentTransactions || [],
                planDistribution: planCounts,
            },
        })
    } catch (error: any) {
        console.error('Dashboard stats error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
