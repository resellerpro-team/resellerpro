import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/services/notificationService'

/**
 * POST /api/notifications/create
 * Internal server usage only.
 */
export async function POST(req: Request) {
    try {
        // Note: In a real production app, we would add an internal secret key check here
        // to prevent external calls if the endpoint is exposed.
        // For now, following the requirement for internal usage.

        const body = await req.json()
        const { userId, type, title, message, entityType, entityId, priority } = body

        if (!userId || !type || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const result = await createNotification({
            userId,
            type,
            title,
            message,
            entityType,
            entityId,
            priority,
        })

        if (!result.success) {
            return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[API Notifications Create] Unexpected error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
