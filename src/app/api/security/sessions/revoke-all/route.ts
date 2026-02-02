import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST: Revoke all sessions except the current one
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json().catch(() => ({}))
        const currentSessionId = body.currentSessionId

        // Delete all sessions except the current one
        let query = supabase
            .from('user_sessions')
            .delete()
            .eq('user_id', user.id)

        if (currentSessionId) {
            query = query.neq('id', currentSessionId)
        }

        const { error } = await query

        if (error) throw error

        return NextResponse.json({
            success: true,
            message: 'All other sessions have been revoked'
        })
    } catch (error: any) {
        console.error('Revoke all sessions error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
