import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // 1. Pending Count
        const pendingPromise = supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'pending')

        // 2. Completed Count
        const completedPromise = supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'completed')

        // 3. Sums
        const sumsPromise = supabase
            .from('orders')
            .select('total_amount, total_profit')
            .eq('user_id', user.id)

        const [pendingRes, completedRes, sumsRes] = await Promise.all([
            pendingPromise,
            completedPromise,
            sumsPromise
        ])

        if (sumsRes.error) throw sumsRes.error

        const totalRevenue = sumsRes.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
        const totalProfit = sumsRes.data?.reduce((sum, o) => sum + (o.total_profit || 0), 0) || 0

        return NextResponse.json({
            totalRevenue,
            totalProfit,
            pendingOrders: pendingRes.count || 0,
            completedOrders: completedRes.count || 0
        })

    } catch (error: any) {
        console.error('Orders Stats API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
