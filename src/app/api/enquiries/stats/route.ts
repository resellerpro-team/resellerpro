import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // 1. Total Count
        const totalPromise = supabase
            .from('enquiries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        // 2. New
        const newPromise = supabase
            .from('enquiries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'new')

        // 3. Follow Up
        const followUpPromise = supabase
            .from('enquiries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'needs_follow_up')

        // 4. Converted
        const convertedPromise = supabase
            .from('enquiries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'converted')

        const [totalRes, newRes, followUpRes, convertedRes] = await Promise.all([
            totalPromise,
            newPromise,
            followUpPromise,
            convertedPromise
        ])

        return NextResponse.json({
            total: totalRes.count || 0,
            new: newRes.count || 0,
            followUp: followUpRes.count || 0,
            converted: convertedRes.count || 0
        })

    } catch (error: any) {
        console.error('Enquiries Stats API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
