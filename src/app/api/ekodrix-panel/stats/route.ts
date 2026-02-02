import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyEkodrixAuth } from '@/lib/ekodrix-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // 🔒 SECURITY: Verify admin authentication
        await verifyEkodrixAuth()

        const supabase = await createAdminClient()

        // Get Free plan ID once for reuse
        const { data: freePlanData } = await supabase
            .from('subscription_plans')
            .select('id')
            .eq('name', 'free')
            .single()

        const freePlanId = freePlanData?.id

        // Get total users count from profiles
        const { count: totalUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        // 🔧 FIX: Get today's new users using created_at from auth.users metadata
        // Since profiles.created_at may not exist, we use updated_at as join date proxy
        // But for accuracy, we check if the user was created today by looking at the earliest updated_at
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Get users whose "updated_at" is close to when they first appeared (join date approximation)
        // Better approach: Check auth.users created_at via admin client
        const { data: authUsers } = await supabase.auth.admin.listUsers()

        const newUsersToday = authUsers?.users?.filter(user => {
            const createdAt = new Date(user.created_at)
            return createdAt >= today
        }).length || 0

        // Get this month's revenue
        const monthStart = new Date()
        monthStart.setDate(1)
        monthStart.setHours(0, 0, 0, 0)

        // Get total revenue from successful transactions
        const { data: revenueData } = await supabase
            .from('payment_transactions')
            .select('amount')
            .eq('status', 'success')

        const totalRevenue = revenueData?.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0

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

        // Get recent activity (last 10 users by activity)
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

        // 🔧 FIX: Get accurate Pro vs Free breakdown
        // Count users WITH subscription records
        const { count: usersWithSubs } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })

        // Free users = users on free plan
        const { count: freeUsersWithRecord } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('plan_id', freePlanId)

        // Pro users = users NOT on free plan
        const { count: proUsersWithRecord } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .neq('plan_id', freePlanId)

        // Users without ANY subscription record are considered "Free" (no plan assigned yet)
        const usersWithoutSub = (totalUsers || 0) - (usersWithSubs || 0)
        const freeUsers = (freeUsersWithRecord || 0) + usersWithoutSub
        const proUsers = proUsersWithRecord || 0

        // Get active subscriptions (paid plans only)
        const { count: activeSubscriptions } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .neq('plan_id', freePlanId)
            .eq('status', 'active')

        // Get plan distribution for chart
        const { data: planDistribution } = await supabase
            .from('user_subscriptions')
            .select('plan:subscription_plans(name, display_name)')

        const planCounts: Record<string, number> = {}
        planDistribution?.forEach((sub: any) => {
            const planName = sub.plan?.display_name || 'Unknown'
            planCounts[planName] = (planCounts[planName] || 0) + 1
        })

        // Add users without subscriptions to "Free" in chart
        if (usersWithoutSub > 0) {
            planCounts['Free (No Sub)'] = usersWithoutSub
        }

        // 🔧 FIX: Active Users = users who logged in during last 24h
        // Check auth.users last_sign_in_at
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        // Filter users who were active in last 24h
        const activeUsersList = authUsers?.users?.filter(user => {
            const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null
            return lastSignIn && lastSignIn >= dayAgo
        }).map(u => u.id) || []

        // Get full profiles for these active users
        const { data: activeProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, email, updated_at')
            .in('id', activeUsersList)

        // Get Average Daily Use Time (from usage_tracking if available)
        const { data: usageData } = await supabase
            .from('usage_tracking')
            .select('count')
            .gte('created_at', dayAgo.toISOString())

        const totalUsage = usageData?.reduce((sum, u) => sum + (u.count || 0), 0) || 0
        const avgUseTime = totalUsage > 0 ? Math.round(totalUsage / (totalUsers || 1) * 2) : 0

        return NextResponse.json({
            success: true,
            data: {
                metrics: {
                    totalUsers: totalUsers || 0,
                    activeSubscriptions: activeSubscriptions || 0,
                    activeUsersHighlights: activeUsersList.length,
                    avgUseTime,
                    freeUsers,
                    proUsers,
                    totalRevenue,
                    monthRevenue,
                    newUsersToday,
                    expiringCount: expiringCount || 0,
                    totalOrders: totalOrders || 0,
                    pendingEnquiries: pendingEnquiries || 0,
                },
                activeUsers: activeProfiles || [],
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
