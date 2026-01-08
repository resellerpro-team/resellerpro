import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    let query = supabase
        .from('enquiries')
        .select('*')
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

    const { data, error } = await query

    if (error) {
        console.error(error)
        return NextResponse.json([], { status: 500 })
    }

    return NextResponse.json(data)
}


export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

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
