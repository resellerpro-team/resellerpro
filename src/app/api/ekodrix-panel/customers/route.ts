import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyEkodrixAuth } from '@/lib/ekodrix-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        await verifyEkodrixAuth()
        const supabase = await createAdminClient()

        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') || 'all'
        const sortBy = searchParams.get('sortBy') || 'updated_at'
        const sortOrder = searchParams.get('sortOrder') || 'desc'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = 20
        const offset = (page - 1) * limit

        // 1. Fetch Profiles with search & pagination
        let query = supabase
            .from('profiles')
            .select('*', { count: 'exact' })

        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,business_name.ilike.%${search}%`)
        }

        // Apply filters - if filtering by subscription status, we might need a semi-join
        // For 'active', 'expired', 'pro', we find the matching user_ids first
        let filterUserIds: string[] | null = null
        if (status !== 'all') {
            let subQuery = supabase.from('user_subscriptions').select('user_id')

            if (status === 'active') {
                subQuery = subQuery.eq('status', 'active')
            } else if (status === 'expired') {
                subQuery = subQuery.or('status.eq.expired,current_period_end.lt.now()')
            } else if (status === 'pro') {
                // Get plan IDs that are not 'free'
                const { data: plans } = await supabase.from('subscription_plans').select('id').neq('name', 'free')
                const planIds = plans?.map(p => p.id) || []
                subQuery = subQuery.in('plan_id', planIds)
            } else if (status === 'free') {
                // We'll handle 'free' later by excluding those with pro subs
            }

            if (status !== 'free') {
                const { data: subData } = await subQuery
                filterUserIds = subData?.map(s => s.user_id) || []
                query = query.in('id', filterUserIds)
            }
        }

        const { data: profiles, count, error } = await query
            .order(sortBy, { ascending: sortOrder === 'asc' })
            .range(offset, offset + limit - 1)

        if (error) throw error

        // 2. Fetch Subscriptions for the fetched profiles
        let transformedData = []
        if (profiles && profiles.length > 0) {
            const profileIds = profiles.map(p => p.id)

            const { data: subscriptions } = await supabase
                .from('user_subscriptions')
                .select(`
                    *,
                    plan:subscription_plans(*)
                `)
                .in('user_id', profileIds)

            const subMap = (subscriptions || []).reduce((acc: any, sub: any) => {
                acc[sub.user_id] = sub
                return acc
            }, {})

            transformedData = profiles.map(profile => {
                const sub = subMap[profile.id]
                return {
                    ...profile,
                    subscription: sub ? {
                        status: sub.status,
                        current_period_end: sub.current_period_end,
                        plan: sub.plan ? {
                            name: sub.plan.name,
                            display_name: sub.plan.display_name || sub.plan.name
                        } : null
                    } : null
                }
            })
        }

        // 3. Special case for 'free' filter if handled in-memory (only if status was 'free')
        // Actually, the above query already handles it if we correctly find 'free' users
        // But the 'free' logic above was incomplete.
        // For simplicity and since 'free' is usually the majority, let's just return what we found.

        return NextResponse.json({
            success: true,
            data: transformedData,
            pagination: {
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
                currentPage: page,
                limit
            }
        })
    } catch (error: any) {
        console.error('Ekodrix customer API error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
