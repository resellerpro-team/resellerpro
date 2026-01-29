import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const sort = searchParams.get('sort') || '-created_at'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
        .from('enquiries')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_deleted', false)

    if (search) {
        query = query.or(
            `customer_name.ilike.%${search}%,phone.ilike.%${search}%,message.ilike.%${search}%`
        )
    }

    if (status && status !== 'all') {
        query = query.eq('status', status)
    }

    const ascending = !sort.startsWith('-')
    const sortField = sort.replace('-', '')

    query = query.order(sortField, { ascending })

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
        console.error(error)
        return NextResponse.json({ data: [], total: 0, page, limit }, { status: 500 })
    }

    return NextResponse.json({
        data,
        total: count,
        page,
        limit
    })
}


export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // --- CHECK LIMITS ---
    const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('plan:subscription_plans(name)')
        .eq('user_id', user.id)
        .single()

    const { PLAN_LIMITS } = await import('@/config/pricing')
    // Handle potential nested array from Supabase join
    const planData = subscription?.plan;
    // @ts-expect-error - Plan data structure can vary
    const planName = (Array.isArray(planData) ? planData[0]?.name : planData?.name);
    const planNameRaw = planName?.toLowerCase() || 'free';
    const planKey = (Object.keys(PLAN_LIMITS).includes(planNameRaw) ? planNameRaw : 'free') as keyof typeof PLAN_LIMITS
    const limits = PLAN_LIMITS[planKey]

    if (limits.enquiries !== Infinity) {
        const periodStart = new Date()
        periodStart.setDate(1)
        periodStart.setHours(0, 0, 0, 0)

        const { count } = await supabase
            .from('enquiries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', periodStart.toISOString())

        if ((count || 0) >= limits.enquiries) {
            return NextResponse.json({
                error: `You've reached your monthly limit of ${limits.enquiries} enquiries on the ${planKey} plan. Upgrade to receive more!`
            }, { status: 403 })
        }
    }


    const { data, error } = await supabase
        .from('enquiries')
        .insert({
            user_id: user.id,
            customer_name: body.customer_name,
            phone: body.phone,
            message: body.message,
            source: 'whatsapp',
            status: 'new',
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
}
