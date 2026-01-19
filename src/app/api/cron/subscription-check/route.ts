
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MailService } from '@/lib/mail'
import { addDays, differenceInDays, format, parseISO } from 'date-fns'

export const dynamic = 'force-dynamic'
// Increase max duration if possible (Vercel specific, but good to have)
export const maxDuration = 60

export async function GET(req: NextRequest) {
    // 1. Security Check
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createAdminClient()
    const today = new Date()

    // 2. Fetch expiring subscriptions
    // We look for profiles where subscription_ends_at is within 7 days
    // And reminders haven't been sent.
    // Note: This logic assumes 'subscription_ends_at' is a timestamptz string.

    // We'll fetch active subscribers.
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

        // Check if subscription_ends_at is valid date
        const expiryDate = new Date(profile.subscription_ends_at)
        const daysUntilExpiry = differenceInDays(expiryDate, today)
        const expiryString = format(expiryDate, 'dd MMM yyyy')

        // 7 Days Reminder
        if (daysUntilExpiry === 7 && !profile.subscription_reminder_7d_sent_at) {
            await MailService.sendSubscriptionReminder(
                profile.email,
                profile.full_name || 'User',
                7,
                expiryString
            )
            await supabase.from('profiles').update({ subscription_reminder_7d_sent_at: new Date().toISOString() }).eq('id', profile.id)
            results.sent7d++
        }
        // 3 Days Reminder
        else if (daysUntilExpiry === 3 && !profile.subscription_reminder_3d_sent_at) {
            await MailService.sendSubscriptionReminder(
                profile.email,
                profile.full_name || 'User',
                3,
                expiryString
            )
            await supabase.from('profiles').update({ subscription_reminder_3d_sent_at: new Date().toISOString() }).eq('id', profile.id)
            results.sent3d++
        }
        // 1 Day Reminder
        else if (daysUntilExpiry === 1 && !profile.subscription_reminder_1d_sent_at) {
            await MailService.sendSubscriptionReminder(
                profile.email,
                profile.full_name || 'User',
                1,
                expiryString
            )
            await supabase.from('profiles').update({ subscription_reminder_1d_sent_at: new Date().toISOString() }).eq('id', profile.id)
            results.sent1d++
        }
    }

    return NextResponse.json({ success: true, results })
}
