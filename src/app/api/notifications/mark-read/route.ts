import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { markAsRead, markAllAsRead } from '@/lib/services/notificationService'

/**
 * POST /api/notifications/mark-read
 * Marks single or all notifications as read.
 */
export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { notificationId, all } = body

        if (all) {
            const result = await markAllAsRead(user.id)
            if (!result.success) {
                return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 })
            }
            return NextResponse.json({ success: true })
        }

        if (!notificationId) {
            return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 })
        }

        const result = await markAsRead(notificationId, user.id)
        if (!result.success) {
            return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[API Notifications Mark-Read] Unexpected error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
