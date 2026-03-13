import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyEkodrixAuth } from '@/lib/ekodrix-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        await verifyEkodrixAuth()
        const supabase = await createAdminClient()

        // ─── Get Free plan ID ────────────────────────────────────────────
        const { data: freePlanData } = await supabase
            .from('subscription_plans')
            .select('id')
            .eq('name', 'free')
            .single()
        const freePlanId = freePlanData?.id

        // ─── Core counts ─────────────────────────────────────────────────
        const { count: totalUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        // ─── Auth users (for signup dates + last_sign_in) ────────────────
        const { data: authUsers } = await supabase.auth.admin.listUsers()
        const allAuthUsers = authUsers?.users || []

        const now = new Date()
        const today = new Date(now); today.setHours(0, 0, 0, 0)
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

        // ─── Signup analytics ────────────────────────────────────────────
        const newUsersToday = allAuthUsers.filter(u => new Date(u.created_at) >= today).length
        const newUsersThisWeek = allAuthUsers.filter(u => new Date(u.created_at) >= weekAgo).length
        const newUsersThisMonth = allAuthUsers.filter(u => new Date(u.created_at) >= monthStart).length
        const newUsersPrevMonth = allAuthUsers.filter(u => {
            const d = new Date(u.created_at)
            return d >= prevMonthStart && d <= prevMonthEnd
        }).length

        // Signup trend (last 30 days, daily)
        const signupTrend: { date: string; count: number }[] = []
        for (let i = 29; i >= 0; i--) {
            const dayStart = new Date(now)
            dayStart.setDate(dayStart.getDate() - i)
            dayStart.setHours(0, 0, 0, 0)
            const dayEnd = new Date(dayStart)
            dayEnd.setHours(23, 59, 59, 999)
            const count = allAuthUsers.filter(u => {
                const d = new Date(u.created_at)
                return d >= dayStart && d <= dayEnd
            }).length
            signupTrend.push({
                date: dayStart.toISOString().slice(0, 10),
                count,
            })
        }

        // ─── Active users (24h) ──────────────────────────────────────────
        const activeUserIds = allAuthUsers
            .filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) >= dayAgo)
            .map(u => u.id)

        const { data: activeProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, email, updated_at')
            .in('id', activeUserIds.length > 0 ? activeUserIds : ['__none__'])

        // ─── Most active users (by login frequency in last 30 days) ─────
        const userLoginMap = new Map<string, { count: number; lastSeen: string }>()
        allAuthUsers.forEach(u => {
            if (u.last_sign_in_at) {
                const lastSeen = new Date(u.last_sign_in_at)
                // Consider "recently active" = signed in within last 30 days
                if (lastSeen >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)) {
                    userLoginMap.set(u.id, {
                        count: 1,  // auth.users only stores last sign-in, so we track presence
                        lastSeen: u.last_sign_in_at,
                    })
                }
            }
        })

        // Enrich with order/enquiry counts to rank by engagement
        const engagementUserIds = [...userLoginMap.keys()]
        let topUsersData: any[] = []

        if (engagementUserIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email, phone, business_name')
                .in('id', engagementUserIds)

            // Get order counts per user
            const { data: orderCounts } = await supabase
                .from('orders')
                .select('user_id')
                .in('user_id', engagementUserIds)

            // Get enquiry counts per user
            const { data: enquiryCounts } = await supabase
                .from('enquiries')
                .select('user_id')
                .in('user_id', engagementUserIds)

            // Get payment totals per user
            const { data: paymentData } = await supabase
                .from('payment_transactions')
                .select('user_id, amount')
                .eq('status', 'success')
                .in('user_id', engagementUserIds)

            // Build engagement scores
            const orderMap = new Map<string, number>()
            orderCounts?.forEach(o => orderMap.set(o.user_id, (orderMap.get(o.user_id) || 0) + 1))

            const enquiryMap = new Map<string, number>()
            enquiryCounts?.forEach(e => enquiryMap.set(e.user_id, (enquiryMap.get(e.user_id) || 0) + 1))

            const revenueMap = new Map<string, number>()
            paymentData?.forEach(p => revenueMap.set(p.user_id, (revenueMap.get(p.user_id) || 0) + parseFloat(p.amount || '0')))

            topUsersData = (profiles || []).map(p => {
                const orders = orderMap.get(p.id) || 0
                const enquiries = enquiryMap.get(p.id) || 0
                const revenue = revenueMap.get(p.id) || 0
                const loginData = userLoginMap.get(p.id)

                // Engagement score = weighted combination
                const engagementScore = (orders * 10) + (enquiries * 5) + (revenue > 0 ? 20 : 0) + (loginData ? 15 : 0)

                return {
                    id: p.id,
                    full_name: p.full_name,
                    email: p.email,
                    phone: p.phone,
                    business_name: p.business_name,
                    orders_count: orders,
                    enquiries_count: enquiries,
                    revenue,
                    last_seen: loginData?.lastSeen || null,
                    engagement_score: engagementScore,
                }
            }).sort((a, b) => b.engagement_score - a.engagement_score)
                .slice(0, 15)
        }

        // ─── Revenue metrics ─────────────────────────────────────────────
        const { data: allSuccessPayments } = await supabase
            .from('payment_transactions')
            .select('amount, created_at')
            .eq('status', 'success')

        const totalRevenue = allSuccessPayments?.reduce((s, t) => s + parseFloat(t.amount || '0'), 0) || 0
        const monthRevenue = allSuccessPayments?.filter(t => new Date(t.created_at) >= monthStart)
            .reduce((s, t) => s + parseFloat(t.amount || '0'), 0) || 0
        const prevMonthRevenue = allSuccessPayments?.filter(t => {
            const d = new Date(t.created_at)
            return d >= prevMonthStart && d <= prevMonthEnd
        }).reduce((s, t) => s + parseFloat(t.amount || '0'), 0) || 0

        // Revenue trend (last 30 days)
        const revenueTrend: { date: string; amount: number }[] = []
        for (let i = 29; i >= 0; i--) {
            const dayStart = new Date(now)
            dayStart.setDate(dayStart.getDate() - i)
            dayStart.setHours(0, 0, 0, 0)
            const dayEnd = new Date(dayStart)
            dayEnd.setHours(23, 59, 59, 999)
            const amount = allSuccessPayments?.filter(t => {
                const d = new Date(t.created_at)
                return d >= dayStart && d <= dayEnd
            }).reduce((s, t) => s + parseFloat(t.amount || '0'), 0) || 0
            revenueTrend.push({ date: dayStart.toISOString().slice(0, 10), amount })
        }

        // MRR (Monthly Recurring Revenue) = sum of active paid subscription prices
        const { data: activeSubs } = await supabase
            .from('user_subscriptions')
            .select('plan:subscription_plans(price)')
            .eq('status', 'active')
            .neq('plan_id', freePlanId)

        const mrr = activeSubs?.reduce((s, sub: any) => s + parseFloat(sub.plan?.price || '0'), 0) || 0

        // ─── Subscription metrics ────────────────────────────────────────
        const { count: activeSubscriptions } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .neq('plan_id', freePlanId)
            .eq('status', 'active')

        const { count: expiringCount } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .lte('current_period_end', new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())
            .gte('current_period_end', now.toISOString())

        // Churn rate = (expired this month / total active at start of month) * 100
        const { count: expiredThisMonth } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'expired')
            .gte('current_period_end', monthStart.toISOString())

        const churnRate = (activeSubscriptions || 0) > 0
            ? Math.round(((expiredThisMonth || 0) / ((activeSubscriptions || 0) + (expiredThisMonth || 0))) * 100)
            : 0

        // Pro/Free breakdown
        const { count: usersWithSubs } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })

        const { count: freeUsersWithRecord } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('plan_id', freePlanId)

        const { count: proUsersWithRecord } = await supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .neq('plan_id', freePlanId)

        const usersWithoutSub = (totalUsers || 0) - (usersWithSubs || 0)
        const freeUsers = (freeUsersWithRecord || 0) + usersWithoutSub
        const proUsers = proUsersWithRecord || 0

        // Plan distribution
        const { data: planDistribution } = await supabase
            .from('user_subscriptions')
            .select('plan:subscription_plans(name, display_name)')

        const planCounts: Record<string, number> = {}
        planDistribution?.forEach((sub: any) => {
            const planName = sub.plan?.display_name || 'Unknown'
            planCounts[planName] = (planCounts[planName] || 0) + 1
        })
        if (usersWithoutSub > 0) planCounts['Free (No Sub)'] = usersWithoutSub

        // ─── Additional counts ───────────────────────────────────────────
        const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true })
        const { count: pendingEnquiries } = await supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new')
        const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true })

        // ─── Recent users & transactions ─────────────────────────────────
        const { data: recentUsers } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone, business_name, updated_at')
            .order('updated_at', { ascending: false })
            .limit(10)

        const { data: recentTransactions } = await supabase
            .from('payment_transactions')
            .select('id, amount, status, created_at, user_id')
            .order('created_at', { ascending: false })
            .limit(10)

        // Enrich recent transactions with profile names
        if (recentTransactions && recentTransactions.length > 0) {
            const txUserIds = [...new Set(recentTransactions.map(t => t.user_id).filter(Boolean))]
            if (txUserIds.length > 0) {
                const { data: txProfiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .in('id', txUserIds)
                const profileMap = new Map(txProfiles?.map(p => [p.id, p]) || [])
                recentTransactions.forEach((tx: any) => {
                    tx.profile = profileMap.get(tx.user_id) || null
                })
            }
        }

        // ─── Expiring soon list (subscription alerts) ────────────────────
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        const { data: expiringSubs } = await supabase
            .from('user_subscriptions')
            .select('user_id, current_period_end, plan:subscription_plans(display_name)')
            .eq('status', 'active')
            .lte('current_period_end', nextWeek.toISOString())
            .gte('current_period_end', now.toISOString())
            .order('current_period_end', { ascending: true })
            .limit(10)

        let expiringAlerts: any[] = []
        if (expiringSubs && expiringSubs.length > 0) {
            const expUserIds = expiringSubs.map(s => s.user_id)
            const { data: expProfiles } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .in('id', expUserIds)
            const profileMap = new Map(expProfiles?.map(p => [p.id, p]) || [])
            expiringAlerts = expiringSubs.map((s: any) => ({
                user_id: s.user_id,
                full_name: profileMap.get(s.user_id)?.full_name || 'Unknown',
                email: profileMap.get(s.user_id)?.email || '',
                plan: s.plan?.display_name || 'Unknown',
                expires_at: s.current_period_end,
                days_left: Math.max(0, Math.ceil((new Date(s.current_period_end).getTime() - now.getTime()) / 86400000)),
            }))
        }

        // ─── Usage analytics ─────────────────────────────────────────────
        const { data: usageData } = await supabase
            .from('usage_tracking')
            .select('count')
            .gte('created_at', dayAgo.toISOString())

        const totalUsage = usageData?.reduce((sum, u) => sum + (u.count || 0), 0) || 0
        const avgUseTime = totalUsage > 0 ? Math.round(totalUsage / (totalUsers || 1) * 2) : 0

        // ─── RESPONSE ────────────────────────────────────────────────────
        return NextResponse.json({
            success: true,
            data: {
                metrics: {
                    totalUsers: totalUsers || 0,
                    activeSubscriptions: activeSubscriptions || 0,
                    activeUsersHighlights: activeUserIds.length,
                    avgUseTime,
                    freeUsers,
                    proUsers,
                    totalRevenue,
                    monthRevenue,
                    prevMonthRevenue,
                    mrr,
                    newUsersToday,
                    newUsersThisWeek,
                    newUsersThisMonth,
                    newUsersPrevMonth,
                    expiringCount: expiringCount || 0,
                    churnRate,
                    totalOrders: totalOrders || 0,
                    totalProducts: totalProducts || 0,
                    pendingEnquiries: pendingEnquiries || 0,
                    revenueGrowth: prevMonthRevenue > 0
                        ? Math.round(((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
                        : monthRevenue > 0 ? 100 : 0,
                    userGrowth: newUsersPrevMonth > 0
                        ? Math.round(((newUsersThisMonth - newUsersPrevMonth) / newUsersPrevMonth) * 100)
                        : newUsersThisMonth > 0 ? 100 : 0,
                },
                activeUsers: activeProfiles || [],
                recentUsers: recentUsers || [],
                recentTransactions: recentTransactions || [],
                planDistribution: planCounts,
                topUsers: topUsersData,
                signupTrend,
                revenueTrend,
                expiringAlerts,
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
