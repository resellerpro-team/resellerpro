import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createAdminClient()
        const { searchParams } = new URL(request.url)

        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') || 'all'
        const planName = searchParams.get('plan') || 'all'
        const sortBy = searchParams.get('sortBy') || 'current_period_end'
        const sortOrder = searchParams.get('sortOrder') || 'desc'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = (page - 1) * limit

        let query = supabase
            .from('user_subscriptions')
            .select(`
                *,
                plan:subscription_plans (*)
            `, { count: 'exact' })

        // Apply filters
        if (status !== 'all') {
            query = query.eq('status', status)
        }

        if (planName !== 'all') {
            const { data: planData } = await supabase
                .from('subscription_plans')
                .select('id')
                .eq('name', planName)
                .single()
            if (planData) {
                query = query.eq('plan_id', planData.id)
            }
        }

        if (search) {
            const { data: profileSearch } = await supabase
                .from('profiles')
                .select('id')
                .or(`full_name.ilike.%${search}%,email.ilike.%${search}%,business_name.ilike.%${search}%`)

            const searchIds = profileSearch?.map(p => p.id) || []
            query = query.in('user_id', searchIds)
        }

        const { data: subscriptions, count, error } = await query
            .order(sortBy, { ascending: sortOrder === 'asc' })
            .range(offset, offset + limit - 1)

        if (error) throw error

        // Handle profile mapping if subscriptions exist
        let formattedSubscriptions = subscriptions || []
        if (formattedSubscriptions.length > 0) {
            const userIds = Array.from(new Set(formattedSubscriptions.map(s => s.user_id))).filter(Boolean)

            if (userIds.length > 0) {
                try {
                    const { data: profiles, error: profileErr } = await supabase
                        .from('profiles')
                        .select('id, full_name, email, business_name')
                        .in('id', userIds)

                    if (!profileErr && profiles) {
                        const profileMap = profiles.reduce((acc: any, p: any) => {
                            acc[p.id] = p
                            return acc
                        }, {})

                        formattedSubscriptions = formattedSubscriptions.map(s => ({
                            ...s,
                            profile: profileMap[s.user_id] || null
                        }))
                    }
                } catch (err) {
                    console.error('Non-critical profile fetch error for subs:', err)
                }
            }
        }

        return NextResponse.json({
            success: true,
            data: formattedSubscriptions,
            pagination: {
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            }
        })
    } catch (error: any) {
        console.error('Ekodrix subscriptions error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
