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
    const priority = searchParams.get('priority')
    const followUpFilter = searchParams.get('follow_up') // 'overdue', 'today', 'upcoming', 'none'
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

    if (priority && priority !== 'all') {
        query = query.eq('priority', priority)
    }

    // Follow-up date filters
    if (followUpFilter) {
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()
        const threeDaysLater = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 23, 59, 59).toISOString()

        switch (followUpFilter) {
            case 'overdue':
                query = query.lt('follow_up_date', todayStart).not('follow_up_date', 'is', null)
                    .in('status', ['new', 'needs_follow_up'])
                break
            case 'today':
                query = query.gte('follow_up_date', todayStart).lte('follow_up_date', todayEnd)
                break
            case 'upcoming':
                query = query.gt('follow_up_date', todayEnd).lte('follow_up_date', threeDaysLater)
                break
            case 'none':
                query = query.is('follow_up_date', null)
                break
        }
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

    // --- CHECK LIMITS with Security Check ---
    const { checkAndDowngradeSubscription } = await import('@/lib/subscription-utils')
    const subscription = await checkAndDowngradeSubscription(user.id)

    if (!subscription) {
        return NextResponse.json({ error: 'Subscription record missing' }, { status: 403 })
    }

    const { PLAN_LIMITS } = await import('@/config/pricing')
    const planData = subscription.plan;
    const planNameRaw = (Array.isArray(planData) ? planData[0]?.name : planData?.name)?.toLowerCase() || 'free';
    const planKey = (Object.keys(PLAN_LIMITS).includes(planNameRaw) ? planNameRaw : 'free') as keyof typeof PLAN_LIMITS
    const limits = PLAN_LIMITS[planKey]

    if (limits.enquiries !== Infinity) {
        const { count } = await supabase
            .from('enquiries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        if ((count || 0) >= limits.enquiries) {
            return NextResponse.json({
                error: `You've reached your total limit of ${limits.enquiries} enquiries on the ${planKey} plan. Upgrade to receive more!`
            }, { status: 403 })
        }
    }

    const insertData: any = {
        user_id: user.id,
        customer_name: body.customer_name,
        phone: body.phone,
        message: body.message,
        source: body.source || 'whatsapp',
        status: 'new',
        priority: body.priority || 'medium',
    }

    // Optional follow-up fields
    if (body.follow_up_date) {
        insertData.follow_up_date = body.follow_up_date
    }
    if (body.follow_up_notes) {
        insertData.follow_up_notes = body.follow_up_notes
    }

    const { data, error } = await supabase
        .from('enquiries')
        .insert(insertData)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log follow-up scheduling if date was set
    if (body.follow_up_date) {
        await supabase.from('enquiry_follow_ups').insert({
            enquiry_id: data.id,
            user_id: user.id,
            action: 'follow_up_scheduled',
            note: `Follow-up scheduled for ${new Date(body.follow_up_date).toLocaleDateString()}`,
        })
    }

    return NextResponse.json(data)
}
