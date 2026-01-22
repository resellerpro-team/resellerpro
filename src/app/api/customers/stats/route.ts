import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        // 1. Total Count
        const totalPromise = supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        // 2. New This Month
        const newPromise = supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', startOfMonth)

        // 3. Repeat (total_orders > 1)
        const repeatPromise = supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gt('total_orders', 1)

        // 4. Financials
        const financialsPromise = supabase
            .from('customers')
            .select('total_spent')
            .eq('user_id', user.id)

        const [totalRes, newRes, repeatRes, financialsRes] = await Promise.all([
            totalPromise,
            newPromise,
            repeatPromise,
            financialsPromise
        ])

        if (financialsRes.error) throw financialsRes.error

        const totalCount = totalRes.count || 0
        const repeatCount = repeatRes.count || 0
        const customers = financialsRes.data || []

        const totalSpent = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0)
        const avgValue = totalCount > 0 ? (totalSpent / totalCount) : 0
        const retentionRate = totalCount > 0 ? ((repeatCount / totalCount) * 100) : 0

        return NextResponse.json({
            total: totalCount,
            newThisMonth: newRes.count || 0,
            repeat: repeatCount,
            retentionRate: Math.round(retentionRate),
            avgValue: Math.round(avgValue)
        })

    } catch (error: any) {
        console.error('Customers Stats API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
