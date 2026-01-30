import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createAdminClient()
        const { searchParams } = new URL(request.url)

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = (page - 1) * limit

        const { data: notifications, count, error } = await supabase
            .from('notifications')
            .select(`
        *,
        profile:profiles (full_name, email)
      `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) throw error

        return NextResponse.json({
            success: true,
            data: notifications || [],
            pagination: {
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            }
        })
    } catch (error: any) {
        console.error('Ekodrix notifications error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createAdminClient()
        const body = await request.json()
        const { title, message, type, priority, target } = body

        if (!title || !message) {
            return NextResponse.json({ success: false, message: 'Title and message are required' }, { status: 400 })
        }

        if (target === 'all') {
            // Get all active users
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('id')

            if (profileError) throw profileError

            const notifications = profiles.map(p => ({
                user_id: p.id,
                title,
                message,
                type: type || 'system',
                priority: priority || 'normal',
                entity_type: 'system',
            }))

            // Batch insert notifications
            const { error: insertError } = await supabase
                .from('notifications')
                .insert(notifications)

            if (insertError) throw insertError

            return NextResponse.json({ success: true, message: `Broadcast sent to ${profiles.length} users` })
        }

        return NextResponse.json({ success: false, message: 'Invalid target' }, { status: 400 })
    } catch (error: any) {
        console.error('Ekodrix broadcast error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
