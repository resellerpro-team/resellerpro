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
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()
        const threeDaysLater = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 23, 59, 59).toISOString()

        // Run all stat queries in parallel
        const [totalRes, newRes, followUpRes, convertedRes, overdueRes, dueTodayRes, dueIn3DaysRes] = await Promise.all([
            // 1. Total Count
            supabase
                .from('enquiries')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_deleted', false),

            // 2. New
            supabase
                .from('enquiries')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_deleted', false)
                .eq('status', 'new'),

            // 3. Follow Up
            supabase
                .from('enquiries')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_deleted', false)
                .eq('status', 'needs_follow_up'),

            // 4. Converted
            supabase
                .from('enquiries')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_deleted', false)
                .eq('status', 'converted'),

            // 5. Overdue (follow_up_date < today AND still open)
            supabase
                .from('enquiries')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_deleted', false)
                .in('status', ['new', 'needs_follow_up'])
                .lt('follow_up_date', todayStart)
                .not('follow_up_date', 'is', null),

            // 6. Due Today
            supabase
                .from('enquiries')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_deleted', false)
                .in('status', ['new', 'needs_follow_up'])
                .gte('follow_up_date', todayStart)
                .lte('follow_up_date', todayEnd),

            // 7. Due in 3 Days
            supabase
                .from('enquiries')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_deleted', false)
                .in('status', ['new', 'needs_follow_up'])
                .gt('follow_up_date', todayEnd)
                .lte('follow_up_date', threeDaysLater),
        ])

        return NextResponse.json({
            total: totalRes.count || 0,
            new: newRes.count || 0,
            followUp: followUpRes.count || 0,
            converted: convertedRes.count || 0,
            overdue: overdueRes.count || 0,
            dueToday: dueTodayRes.count || 0,
            dueIn3Days: dueIn3DaysRes.count || 0,
        })

    } catch (error: any) {
        console.error('Enquiries Stats API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
