
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MailService } from '@/lib/mail'
import { differenceInDays, format } from 'date-fns'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
    // 1. Security Check
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createAdminClient()
    const today = new Date()

    // 2. Fetch Free Plan ID for downgrades
    const { data: freePlan } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('name', 'free')
        .single()

    // 3. BATCH DOWNGRADE: Find all expired paid subscriptions
    // We check user_subscriptions table as it's the source of truth for plans
    const { data: expiredSubs } = await supabase
        .from('user_subscriptions')
        .select('user_id, plan:subscription_plans(name)')
        .lt('current_period_end', today.toISOString())
        .eq('status', 'active')

    const actuallyExpired = expiredSubs?.filter(s => (s.plan as any)?.name !== 'free') || []

    if (actuallyExpired.length > 0 && freePlan) {
        console.log(`[CRON] Downgrading ${actuallyExpired.length} expired subscriptions`)
        for (const sub of actuallyExpired) {
            // Perform downgrade in user_subscriptions (primary source of truth)
            await supabase
                .from('user_subscriptions')
                .update({
                    plan_id: freePlan.id,
                    status: 'active', // Free is always active
                    current_period_start: today.toISOString(),
                    current_period_end: new Date(today.getTime() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
                    cancel_at_period_end: false,
                    updated_at: today.toISOString()
                })
                .eq('user_id', sub.user_id)
        }
    }

    // 4. Fetch active subscriptions for reminders (those expiring soon)
    // We join with profiles to get the email and name
    const { data: subscriptions, error } = await supabase
        .from('user_subscriptions')
        .select(`
            current_period_end,
            profile:profiles (
                email,
                full_name
            )
        `)
        .eq('status', 'active')
        .not('current_period_end', 'is', null)

    if (error || !subscriptions) {
        return NextResponse.json({ error: error?.message, results: { checked: 0 } }, { status: 500 })
    }

    const results = {
        checked: subscriptions.length,
        downgraded: actuallyExpired.length,
        sent7d: 0,
        sent3d: 0,
        sent1d: 0
    }

    for (const sub of subscriptions) {
        const profile = sub.profile as any
        if (!sub.current_period_end || !profile?.email) continue

        const expiryDate = new Date(sub.current_period_end)
        const daysUntilExpiry = differenceInDays(expiryDate, today)
        const expiryString = format(expiryDate, 'dd MMM yyyy')

        // We only care about 7, 3, and 1 days before expiry
        if (![7, 3, 1].includes(daysUntilExpiry)) continue

        // Check if we already sent this specific reminder
        // We use metadata to track: type, specific daysLeft, and for which expiry date
        const { data: existingLogs } = await supabase
            .from('email_logs')
            .select('id')
            .eq('recipient', profile.email)
            .contains('metadata', {
                type: 'subscription_reminder',
                daysLeft: daysUntilExpiry,
                expiryDate: expiryString
            })
            .limit(1)

        const alreadySent = existingLogs && existingLogs.length > 0

        if (!alreadySent) {
            const { success, error: sendError } = await MailService.sendSubscriptionReminder(
                profile.email,
                profile.full_name || 'User',
                daysUntilExpiry,
                expiryString
            )

            if (success) {
                if (daysUntilExpiry === 7) results.sent7d++
                if (daysUntilExpiry === 3) results.sent3d++
                if (daysUntilExpiry === 1) results.sent1d++
            } else {
                console.error(`Failed to send reminder to ${profile.email}:`, sendError)
            }
        }
    }

    return NextResponse.json({ success: true, results })
}
