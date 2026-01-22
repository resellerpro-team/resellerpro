
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
    const twelveHoursAgo = subHours(new Date(), 12).toISOString()

    // 1. Fetch pending orders
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!orders || orders.length === 0) {
        return NextResponse.json({ success: true, sent: 0, message: 'No pending orders' })
    }

    // 2. Fetch User Profiles manually
    const userIds = Array.from(new Set(orders.map(o => o.user_id).filter(Boolean)))

    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds)

    if (profileError) {
        return NextResponse.json({ error: 'Failed to fetch profiles: ' + profileError.message }, { status: 500 })
    }

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

    // 3. Group by user
    const userOrders: Record<string, { email: string, name: string, count: number }> = {}

    for (const order of orders) {
        const userId = order.user_id
        const profile = profileMap.get(userId)

        if (!profile || !profile.email) continue

        if (!userOrders[userId]) {
            userOrders[userId] = {
                email: profile.email,
                name: profile.full_name || 'User',
                count: 0
            }
        }
        userOrders[userId].count++
    }

    let sentCount = 0
    const results = []

    // 4. Check throttling and send digest
    for (const userId in userOrders) {
        const { email, name, count } = userOrders[userId]

        // Check 12-hour throttle
        const { data: recentLogs } = await supabase
            .from('email_logs')
            .select('id, created_at')
            .eq('recipient', email)
            .contains('metadata', { type: 'order_alert' })
            .gt('created_at', twelveHoursAgo)
            .limit(1)

        if (recentLogs && recentLogs.length > 0) {
            results.push({ email, status: 'throttled', lastSent: recentLogs[0].created_at })
            continue
        }

        // Send Digest Email
        console.log(`Sending order alert to ${email} (Count: ${count})`)
        const sendResult = await MailService.sendOrderAlert(email, name, count)

        if (sendResult.success) {
            sentCount++
            results.push({ email, status: 'sent', count })
        } else {
            results.push({ email, status: 'failed', error: sendResult.error })
        }
    }

    return NextResponse.json({ success: true, sent: sentCount, details: results })
}
