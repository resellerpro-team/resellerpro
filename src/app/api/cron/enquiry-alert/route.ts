
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MailService } from '@/lib/mail'
import { subHours } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createAdminClient()
    const now = new Date()
    const twelveHoursAgo = subHours(now, 12).toISOString()

    // Find enquiries that are pending and haven't been reminded in the last 12 hours
    // We assume there is a 'status' column and 'user_id' column.
    // We first fetch pending enquiries.
    const { data: enquiries, error } = await supabase
        .from('enquiries')
        .select('*, profiles:user_id(email, full_name)')
        .eq('status', 'pending') // Adjust status based on actual schema ('new', 'unread', etc.)
        .or(`last_reminder_sent_at.is.null,last_reminder_sent_at.lt.${twelveHoursAgo}`)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!enquiries || enquiries.length === 0) {
        return NextResponse.json({ success: true, sent: 0 })
    }

    // Group by user
    const userEnquiries: Record<string, { email: string, name: string, count: number, ids: string[] }> = {}

    for (const enquiry of enquiries) {
        const userId = enquiry.user_id
        // Profile might be joined as an array or single object depending on relation type, usually object for belongs_to
        const profile = Array.isArray(enquiry.profiles) ? enquiry.profiles[0] : enquiry.profiles

        if (!profile || !profile.email) continue

        if (!userEnquiries[userId]) {
            userEnquiries[userId] = {
                email: profile.email,
                name: profile.full_name || 'User',
                count: 0,
                ids: []
            }
        }
        userEnquiries[userId].count++
        userEnquiries[userId].ids.push(enquiry.id)
    }

    let sentCount = 0

    for (const userId in userEnquiries) {
        const { email, name, count, ids } = userEnquiries[userId]

        // Send Email
        await MailService.sendEnquiryAlert(email, name, count)

        // Update last_reminder_sent_at for these enquiries
        await supabase
            .from('enquiries')
            .update({ last_reminder_sent_at: now.toISOString() })
            .in('id', ids)

        sentCount++
    }

    return NextResponse.json({ success: true, sent: sentCount })
}
