import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET: Fetch login history for current user
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: history, error } = await supabase
            .from('user_sessions')
            .select('id, ip_address, location, browser, os, device_type, login_success, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        if (error) throw error

        return NextResponse.json({
            success: true,
            history: history || []
        })
    } catch (error: any) {
        console.error('Get login history error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
