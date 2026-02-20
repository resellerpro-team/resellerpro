import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const { data: existing } = await supabase
        .from("enquiries")
        .select("status")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

    if (!existing) {
        return NextResponse.json({ error: "Enquiry not found" }, { status: 404 })
    }

    const nextStatus = body.status
    const currentStatus = existing.status

    if (nextStatus) {
        if (["converted", "dropped"].includes(currentStatus)) {
            return NextResponse.json(
                { error: "This enquiry is already closed" },
                { status: 400 }
            )
        }

        if (nextStatus === "needs_follow_up" && currentStatus !== "new") {
            return NextResponse.json(
                { error: "Only new enquiries can be marked as contacted" },
                { status: 400 }
            )
        }

        if (nextStatus === "converted" && currentStatus !== "needs_follow_up") {
            return NextResponse.json(
                { error: "Only contacted enquiries can be converted" },
                { status: 400 }
            )
        }

        if (
            nextStatus === "dropped" &&
            !["new", "needs_follow_up"].includes(currentStatus)
        ) {
            return NextResponse.json(
                { error: "This enquiry cannot be closed" },
                { status: 400 }
            )
        }
    }

    // Separate protected fields from update payload
    const { user_id, created_at, updated_at, id: _id, ...updates } = body

    const updatePayload: any = {
        ...updates,
        updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
        .from("enquiries")
        .update(updatePayload)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Auto-log follow-up scheduling if date changed
    if (body.follow_up_date) {
        await supabase.from('enquiry_follow_ups').insert({
            enquiry_id: id,
            user_id: user.id,
            action: 'follow_up_scheduled',
            note: `Follow-up rescheduled to ${new Date(body.follow_up_date).toLocaleDateString()}`,
        })
    }

    // Auto-log status changes
    if (nextStatus && nextStatus !== currentStatus) {
        await supabase.from('enquiry_follow_ups').insert({
            enquiry_id: id,
            user_id: user.id,
            action: 'status_changed',
            note: `Status changed from "${currentStatus}" to "${nextStatus}"`,
        })
    }

    return NextResponse.json(data)
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Soft delete
    const { error } = await supabase
        .from('enquiries')
        .update({ is_deleted: true })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
}
