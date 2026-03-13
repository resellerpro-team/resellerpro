import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyEkodrixAuth } from '@/lib/ekodrix-auth'

export const dynamic = 'force-dynamic'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await verifyEkodrixAuth()
        const supabase = await createAdminClient()
        const { id } = params

        // ─── 1. Profile (ALL contact info) ────────────────────────────────
        const { data: customer, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single()

        if (profileErr) throw profileErr

        // ─── 2. Auth metadata (created_at, last_sign_in) ─────────────────
        let authCreatedAt: string | null = null
        let lastSignIn: string | null = null
        try {
            const { data: { user: authUser } } = await supabase.auth.admin.getUserById(id)
            authCreatedAt = authUser?.created_at || null
            lastSignIn = authUser?.last_sign_in_at || null
        } catch { }

        // ─── 3. Subscription with plan details ───────────────────────────
        const { data: sub } = await supabase
            .from('user_subscriptions')
            .select(`*, plan:subscription_plans (*)`)
            .eq('user_id', id)
            .single()

        // ─── 4. Order metrics ─────────────────────────────────────────────
        const [
            { count: ordersCount },
            { count: enquiriesCount },
            { data: allOrders },
            { data: recentOrders },
        ] = await Promise.all([
            supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', id),
            supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('user_id', id),
            supabase.from('orders').select('total_amount, created_at, status').eq('user_id', id),
            supabase.from('orders').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(10),
        ])

        // ─── 5. Financial metrics ────────────────────────────────────────
        const { data: recentTransactions } = await supabase
            .from('payment_transactions')
            .select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: false })
            .limit(10)

        const { data: allPayments } = await supabase
            .from('payment_transactions')
            .select('amount, status, created_at')
            .eq('user_id', id)
            .eq('status', 'success')

        // ─── 6. Enquiries (recent) ───────────────────────────────────────
        const { data: recentEnquiries } = await supabase
            .from('enquiries')
            .select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: false })
            .limit(10)

        // ─── 7. Products count ───────────────────────────────────────────
        const { count: productsCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', id)

        // ─── 8. Wallet transactions ──────────────────────────────────────
        const { data: walletTxns } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: false })
            .limit(5)

        // ─── 9. Referral data ────────────────────────────────────────────
        const { data: referrals } = await supabase
            .from('referrals')
            .select('*, referee:profiles!referrals_referee_id_fkey(full_name, email)')
            .eq('referrer_id', id)

        const { data: referredBy } = await supabase
            .from('referrals')
            .select('*, referrer:profiles!referrals_referrer_id_fkey(full_name, email)')
            .eq('referee_id', id)
            .single()

        // ─── 10. Usage data ─────────────────────────────────────────────
        const { data: usageData } = await supabase
            .from('usage_tracking')
            .select('*')
            .eq('user_id', id)
            .order('period_start', { ascending: false })
            .limit(12)

        // ─── COMPUTE ANALYTICS ──────────────────────────────────────────
        const ltv = allPayments?.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0) || 0
        const totalOrderRevenue = allOrders?.reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0) || 0
        const aov = (ordersCount && ordersCount > 0) ? (totalOrderRevenue / ordersCount) : 0

        const joinedDate = authCreatedAt || customer.updated_at
        const daysAsCustomer = joinedDate
            ? Math.floor((Date.now() - new Date(joinedDate).getTime()) / 86400000)
            : 0

        const subDaysRemaining = sub?.current_period_end
            ? Math.max(0, Math.ceil((new Date(sub.current_period_end).getTime() - Date.now()) / 86400000))
            : 0

        // Build activity timeline from real data
        const timeline: any[] = []

        // Add signup event
        if (authCreatedAt) {
            timeline.push({
                id: 'signup',
                type: 'signup',
                title: 'Account Created',
                description: 'User signed up on the platform',
                timestamp: authCreatedAt,
            })
        }

        // Add order events
        recentOrders?.forEach(order => {
            timeline.push({
                id: `order-${order.id}`,
                type: 'order',
                title: `Order #${order.order_number || order.id.slice(0, 8)}`,
                description: `₹${parseFloat(order.total_amount || 0).toLocaleString('en-IN')} — ${order.status}`,
                timestamp: order.created_at,
            })
        })

        // Add payment events
        recentTransactions?.forEach(tx => {
            timeline.push({
                id: `payment-${tx.id}`,
                type: tx.status === 'success' ? 'payment' : 'failed',
                title: tx.status === 'success' ? 'Payment Successful' : 'Payment Failed',
                description: `₹${parseFloat(tx.amount || 0).toLocaleString('en-IN')}`,
                timestamp: tx.created_at,
            })
        })

        // Add enquiry events
        recentEnquiries?.forEach(enq => {
            timeline.push({
                id: `enquiry-${enq.id}`,
                type: 'enquiry',
                title: `Enquiry from ${enq.customer_name || 'Customer'}`,
                description: enq.message?.slice(0, 80),
                timestamp: enq.created_at,
            })
        })

        // Sort by timestamp descending
        timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        // ─── RESPONSE ───────────────────────────────────────────────────
        return NextResponse.json({
            success: true,
            data: {
                // Profile data
                ...customer,
                auth_created_at: authCreatedAt,
                last_sign_in: lastSignIn,

                // Subscription
                subscription: sub ? {
                    id: sub.id,
                    status: sub.status,
                    current_period_start: sub.current_period_start,
                    current_period_end: sub.current_period_end,
                    cancel_at_period_end: sub.cancel_at_period_end,
                    plan: sub.plan ? {
                        id: sub.plan.id,
                        name: sub.plan.name,
                        display_name: sub.plan.display_name,
                        price: sub.plan.price,
                        billing_period: sub.plan.billing_period,
                        features: sub.plan.features,
                    } : null,
                } : null,

                // Metrics
                metrics: {
                    ltv,
                    aov: Math.round(aov),
                    orders_count: ordersCount || 0,
                    enquiries_count: enquiriesCount || 0,
                    products_count: productsCount || 0,
                    days_as_customer: daysAsCustomer,
                    sub_days_remaining: subDaysRemaining,
                },

                // Activity data
                recentOrders: recentOrders || [],
                recentTransactions: recentTransactions || [],
                recentEnquiries: recentEnquiries || [],
                walletTransactions: walletTxns || [],
                usageData: usageData || [],
                timeline,

                // Referral data
                referrals: referrals || [],
                referredBy: referredBy || null,
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
