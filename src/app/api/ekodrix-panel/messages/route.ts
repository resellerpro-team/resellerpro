import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyEkodrixAuth } from '@/lib/ekodrix-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        // 🔒 SECURITY: Verify admin authentication
        await verifyEkodrixAuth()

        const supabase = await createAdminClient()
        const body = await request.json()
        const { userId, title, message, priority = 'normal' } = body

        if (!userId || !title || !message) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
        }

        // Create notification for the user
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type: 'system',
                priority,
                title,
                message,
                is_read: false
            })

        if (error) throw error

        return NextResponse.json({ success: true, message: 'Message sent successfully' })
    } catch (error: any) {
        console.error('Ekodrix messaging error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
