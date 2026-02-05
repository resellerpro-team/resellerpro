import { createAdminClient } from './supabase/admin'

/**
 * Checks if a user's subscription has expired and downgrades them to the free plan if necessary.
 * This is a "self-healing" function that ensures the database is always consistent with the current time.
 */
export async function checkAndDowngradeSubscription(userId: string) {
    const supabase = await createAdminClient()

    // Fetch current subscription
    const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select(`*, plan:subscription_plans(*)`)
        .eq('user_id', userId)
        .single()

    if (!subscription) return null

    const planData = subscription.plan
    const planNameRaw = (Array.isArray(planData) ? planData[0]?.name : planData?.name)?.toLowerCase() || 'free'
    const isExpired = subscription.current_period_end && new Date(subscription.current_period_end) < new Date()

    // Only downgrade if it's a paid plan and it's expired
    if (planNameRaw !== 'free' && isExpired) {
        console.log(`[SUBSCRIPTION-UTILITY] Downgrading expired plan for user ${userId}: ${planNameRaw}`)

        // Get Free Plan ID
        const { data: freePlan } = await supabase
            .from('subscription_plans')
            .select('id')
            .eq('name', 'free')
            .single()

        if (freePlan) {
            const { error: updateError } = await supabase
                .from('user_subscriptions')
                .update({
                    plan_id: freePlan.id,
                    status: 'active',
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
                    cancel_at_period_end: false,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)

            if (!updateError) {
                // Return the fresh downgraded subscription
                const { data: updatedSub } = await supabase
                    .from('user_subscriptions')
                    .select(`*, plan:subscription_plans(*)`)
                    .eq('user_id', userId)
                    .single()

                return updatedSub
            }
        }
    }

    return subscription
}
