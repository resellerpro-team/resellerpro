
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

    // 2. Fetch active subscriptions
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('subscription_status', 'expired')
        .not('subscription_ends_at', 'is', null)

    if (error || !profiles) {
        return NextResponse.json({ error: error?.message }, { status: 500 })
    }

    const results = {
        checked: profiles.length,
        sent7d: 0,
        sent3d: 0,
        sent1d: 0
    }

    for (const profile of profiles) {
        if (!profile.subscription_ends_at || !profile.email) continue

        const expiryDate = new Date(profile.subscription_ends_at)
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
