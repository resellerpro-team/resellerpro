import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkTimeBasedNotifications } from '@/lib/services/notificationService'

/**
 * GET /api/notifications
 * Returns notifications for the logged-in user.
 * Unread first, then latest first.
 */
export async function GET(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Trigger time-based notification checks (runs in background)
        // We don't await it to avoid slowing down the response
        checkTimeBasedNotifications(user.id).catch(err =>
            console.error('[API Notifications] Time-based check error:', err)
        )

        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const offset = (page - 1) * limit

        // Fetch notifications: is_read=false first, then created_at DESC
        const { data, error, count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .order('is_read', { ascending: true }) // false (0) comes before true (1) in some DBs, but is_read is bool. In Postgres, FALSE < TRUE. So ascending: true puts FALSE first.
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            console.error('[API Notifications] Fetch error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            data,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil((count || 0) / limit),
            },
        })
    } catch (error) {
        console.error('[API Notifications] Unexpected error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
