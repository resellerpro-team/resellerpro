import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyEkodrixAuth } from '@/lib/ekodrix-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        // 🔒 SECURITY: Verify admin authentication
        await verifyEkodrixAuth()

        const supabase = await createAdminClient()
        const { searchParams } = new URL(request.url)

        const search = searchParams.get('search') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = (page - 1) * limit

        // 🔒 SECURITY: Sanitize search input to prevent SQL injection
        const sanitizeSearch = (input: string): string => {
            return input.replace(/[%_\\'"]/g, '\\$&')
        }

        let query = supabase
            .from('referrals')
            .select(`
                *,
                referrer:profiles!referrals_referrer_id_fkey(full_name, email),
                referee:profiles!referrals_referee_id_fkey(full_name, email)
            `, { count: 'exact' })

        // Apply search if provided
        if (search) {
            const safeSearch = sanitizeSearch(search)

            // We need to find profile IDs first because join filter in Supabase can be tricky
            const { data: profileIds } = await supabase
                .from('profiles')
                .select('id')
                .or(`full_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`)

            const ids = profileIds?.map(p => p.id) || []
            query = query.or(`referrer_id.in.(${ids.join(',')}),referee_id.in.(${ids.join(',')})`)
        }

        const { data: referrals, count, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) throw error

        // Growth Summary
        const { count: completedCount } = await supabase
            .from('referrals')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed')

        return NextResponse.json({
            success: true,
            data: referrals || [],
            summary: {
                totalReferrals: count || 0,
                completedReferrals: completedCount || 0,
                pendingReferrals: (count || 0) - (completedCount || 0)
            },
            pagination: {
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            }
        })
    } catch (error: any) {
        console.error('Ekodrix referrals error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
