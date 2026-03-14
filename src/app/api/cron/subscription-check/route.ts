
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
            // 1. Perform downgrade in user_subscriptions
            await supabase
                .from('user_subscriptions')
                .update({
                    plan_id: freePlan.id,
                    status: 'active', // Keep active for free plan to maintain feature access
                    current_period_start: today.toISOString(),
                    current_period_end: new Date(today.getTime() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
                    cancel_at_period_end: false,
                    updated_at: today.toISOString()
                })
                .eq('user_id', sub.user_id)

            // 2. Create "Subscription Expired" notification
            // Note: sub.id comes from the query if we update it, but let's make sure we have sub details
            const { data: subDetails } = await supabase
                .from('user_subscriptions')
                .select('id')
                .eq('user_id', sub.user_id)
                .single()

            if (subDetails) {
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: sub.user_id,
                        type: 'subscription_expired',
                        title: 'Subscription Expired',
                        message: 'Your subscription has expired. Your account has been downgraded to the free plan.',
                        entity_type: 'subscription',
                        entity_id: subDetails.id,
                        priority: 'high'
                    })
            }
        }
    }

    // 4. Fetch active subscriptions for reminders (those expiring soon)
    // We join with profiles to get the email and name
    const { data: subscriptions, error } = await supabase
        .from('user_subscriptions')
        .select(`
            id,
            current_period_end,
            user_id,
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

        // We care about 7, 3, and 1 days before expiry
        if (![7, 3, 1].includes(daysUntilExpiry)) continue

        // Determine notification type and metadata
        let notificationType: any = null
        let title = ""
        let message = ""

        if (daysUntilExpiry === 7) {
            notificationType = 'subscription_7_day'
            title = 'Subscription expires in 7 days'
            message = `Your plan expires on ${expiryString}. Renew now to keep your benefits.`
        } else if (daysUntilExpiry === 3) {
            notificationType = 'subscription_3_day'
            title = '⚠️ 3 Days Remaining'
            message = `Urgent: Your subscription expires in 3 days (${expiryString}).`
        } else if (daysUntilExpiry === 1) {
            notificationType = 'subscription_1_day'
            title = '🔴 Final Notice: 1 Day Left'
            message = 'Your subscription expires tomorrow. Act now to avoid service interruption!'
        }

        if (notificationType) {
            // Create in-app notification
            const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                    user_id: sub.user_id,
                    type: notificationType,
                    title,
                    message,
                    entity_type: 'subscription',
                    entity_id: sub.id,
                    priority: daysUntilExpiry <= 3 ? 'high' : 'normal',
                    data: { daysLeft: daysUntilExpiry, expiryDate: expiryString }
                })
            
            if (notifError && (notifError as any).code !== '23505') { // Ignore unique constraint violation
                console.error(`Failed to create in-app notification for ${profile.email}:`, notifError)
            }
        }

        // Email Reminders (Existing Logic for 7, 3, 1)
        if ([7, 3, 1].includes(daysUntilExpiry)) {
            // Check if we already sent this specific reminder
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
                    console.error(`Failed to send email reminder to ${profile.email}:`, sendError)
                }
            }
        }
    }

    return NextResponse.json({ success: true, results })
}
