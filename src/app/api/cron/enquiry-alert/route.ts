
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MailService } from '@/lib/mail'
import { subHours, startOfDay, endOfDay, addDays } from 'date-fns'


export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createAdminClient()
    const twelveHoursAgo = subHours(new Date(), 12).toISOString()

    const now = new Date()
    const todayStart = startOfDay(now).toISOString()
    const todayEnd = endOfDay(now).toISOString()
    const threeDaysFromNow = endOfDay(addDays(now, 3)).toISOString()

    // 1. Fetch enquiries that need attention:
    //    - Status is 'new' or 'needs_follow_up'
    //    - AND (follow_up_date is today OR follow_up_date is within 3 days OR follow_up_date is overdue OR no follow_up_date but still pending)
    const { data: enquiries, error } = await supabase
        .from('enquiries')
        .select('*')
        .in('status', ['new', 'needs_follow_up'])
        .eq('is_deleted', false)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!enquiries || enquiries.length === 0) {
        return NextResponse.json({ success: true, sent: 0, message: 'No pending enquiries' })
    }

    // Categorize enquiries by urgency
    const categorized = enquiries.reduce((acc, enq) => {
        if (enq.follow_up_date) {
            const followUpDate = new Date(enq.follow_up_date)
            if (followUpDate < new Date(todayStart)) {
                acc.overdue.push(enq)
            } else if (followUpDate >= new Date(todayStart) && followUpDate <= new Date(todayEnd)) {
                acc.today.push(enq)
            } else if (followUpDate <= new Date(threeDaysFromNow)) {
                acc.upcoming.push(enq)
            }
        } else {
            acc.pending.push(enq)
        }
        return acc
    }, { overdue: [] as any[], today: [] as any[], upcoming: [] as any[], pending: [] as any[] })

    // 2. Fetch User Profiles
    const userIds = Array.from(new Set(enquiries.map(e => e.user_id).filter(Boolean)))

    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds)

    if (profileError) {
        return NextResponse.json({ error: 'Failed to fetch profiles: ' + profileError.message }, { status: 500 })
    }

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

    // 3. Group by user with urgency context
    const userAlerts: Record<string, {
        email: string,
        name: string,
        overdue: number,
        today: number,
        upcoming: number,
        pending: number,
        total: number
    }> = {}

    for (const enquiry of enquiries) {
        const userId = enquiry.user_id
        const profile = profileMap.get(userId)

        if (!profile || !profile.email) continue

        if (!userAlerts[userId]) {
            userAlerts[userId] = {
                email: profile.email,
                name: profile.full_name || 'User',
                overdue: 0,
                today: 0,
                upcoming: 0,
                pending: 0,
                total: 0
            }
        }

        userAlerts[userId].total++

        if (categorized.overdue.includes(enquiry)) userAlerts[userId].overdue++
        else if (categorized.today.includes(enquiry)) userAlerts[userId].today++
        else if (categorized.upcoming.includes(enquiry)) userAlerts[userId].upcoming++
        else userAlerts[userId].pending++
    }

    let sentCount = 0
    const results = []

    // 4. Send alerts with throttling
    for (const userId in userAlerts) {
        const alert = userAlerts[userId]

        // Check if we sent an enquiry alert recently
        const { data: recentLogs } = await supabase
            .from('email_logs')
            .select('id, created_at')
            .eq('recipient', alert.email)
            .contains('metadata', { type: 'enquiry_alert' })
            .gt('created_at', twelveHoursAgo)
            .limit(1)

        if (recentLogs && recentLogs.length > 0) {
            results.push({ email: alert.email, status: 'throttled', lastSent: recentLogs[0].created_at })
            continue
        }

        // Enhanced count with urgency breakdown
        const urgencyCount = alert.overdue > 0
            ? alert.total  // Always send if overdue
            : alert.today > 0
                ? alert.total  // Always send if due today
                : alert.upcoming > 0
                    ? alert.total
                    : alert.pending > 0
                        ? alert.total
                        : 0

        if (urgencyCount === 0) continue

        const sendResult = await MailService.sendEnquiryAlert(alert.email, alert.name, urgencyCount)

        if (sendResult.success) {
            sentCount++
            results.push({
                email: alert.email,
                status: 'sent',
                breakdown: {
                    overdue: alert.overdue,
                    today: alert.today,
                    upcoming: alert.upcoming,
                    pending: alert.pending,
                }
            })
        } else {
            results.push({ email: alert.email, status: 'failed', error: sendResult.error })
        }
    }

    return NextResponse.json({
        success: true,
        sent: sentCount,
        summary: {
            totalOverdue: categorized.overdue.length,
            totalDueToday: categorized.today.length,
            totalUpcoming: categorized.upcoming.length,
            totalPending: categorized.pending.length,
        },
        details: results
    })
}
