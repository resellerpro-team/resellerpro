import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyEkodrixAuth } from '@/lib/ekodrix-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // 🔒 SECURITY: Verify admin authentication
        await verifyEkodrixAuth()

        const supabase = await createAdminClient()

        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('price', { ascending: true })

        if (error) throw error

        return NextResponse.json({
            success: true,
            data: data || []
        })
    } catch (error: any) {
        console.error('Ekodrix plans error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
