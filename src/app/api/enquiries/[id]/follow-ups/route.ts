import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET: Fetch activity timeline for an enquiry
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify enquiry belongs to user
    const { data: enquiry } = await supabase
        .from('enquiries')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!enquiry) {
        return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })
    }

    const { data, error } = await supabase
        .from('enquiry_follow_ups')
        .select('*')
        .eq('enquiry_id', id)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
}

// POST: Log a follow-up activity
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify enquiry belongs to user
    const { data: enquiry } = await supabase
        .from('enquiries')
        .select('id, follow_up_count')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!enquiry) {
        return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })
    }

    const body = await req.json()
    const { action, note, whatsapp_message } = body

    const validActions = ['whatsapp_sent', 'called', 'note_added', 'status_changed', 'follow_up_scheduled']
    if (!action || !validActions.includes(action)) {
        return NextResponse.json({ error: 'Invalid action type' }, { status: 400 })
    }

    // Insert activity log
    const { data, error } = await supabase
        .from('enquiry_follow_ups')
        .insert({
            enquiry_id: id,
            user_id: user.id,
            action,
            note,
            whatsapp_message,
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update enquiry metadata
    const updatePayload: any = {
        follow_up_count: (enquiry.follow_up_count || 0) + 1,
        updated_at: new Date().toISOString(),
    }

    // If WhatsApp was sent or call was made, update last_contacted_at
    if (['whatsapp_sent', 'called'].includes(action)) {
        updatePayload.last_contacted_at = new Date().toISOString()
    }

    await supabase
        .from('enquiries')
        .update(updatePayload)
        .eq('id', id)

    return NextResponse.json(data)
}
