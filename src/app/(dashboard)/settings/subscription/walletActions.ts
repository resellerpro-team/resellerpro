'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Activate subscription using ONLY wallet balance (no Razorpay)
 * Called when wallet covers 100% of subscription price
 */
export async function activateWithWallet(planId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Not authenticated' }

    try {
        // Get plan details
        const { data: plan } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', planId)
            .single()

        if (!plan) {
            return { success: false, message: 'Plan not found' }
        }

        // Get wallet balance
        const { data: profile } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', user.id)
            .single()

        const walletBalance = parseFloat(profile?.wallet_balance || '0')

        if (walletBalance < plan.price) {
            return { success: false, message: 'Insufficient wallet balance' }
        }

        // Use Admin Client for database updates
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const adminSupabase = await createAdminClient()

        // Deduct wallet balance
        const { error: walletError } = await adminSupabase
            .rpc('add_wallet_transaction', {
                p_user_id: user.id,
                p_amount: -plan.price,
                p_type: 'subscription_debit',
                p_description: `Subscription payment - ${plan.display_name}`,
            })

        if (walletError) {
            console.error('❌ Wallet deduction error:', walletError)
            return { success: false, message: 'Failed to deduct wallet balance' }
        }

        // Activate subscription
        const now = new Date()
        const periodEnd = new Date(now)
        periodEnd.setMonth(periodEnd.getMonth() + 1)

        const { error: subUpdateError } = await adminSupabase
            .from('user_subscriptions')
            .update({
                plan_id: planId,
                status: 'active',
                current_period_start: now.toISOString(),
                current_period_end: periodEnd.toISOString(),
                cancel_at_period_end: false,
            })
            .eq('user_id', user.id)

        if (subUpdateError) {
            console.error('❌ Subscription update error:', subUpdateError)
            return { success: false, message: 'Failed to update subscription' }
        }

        // Process referral rewards
        try {
            await adminSupabase.rpc('process_referral_rewards', {
                p_referee_id: user.id,
            })
        } catch (rewardError) {
            console.error('❌ Referral reward error:', rewardError)
        }

        revalidatePath('/settings/subscription')
        revalidatePath('/settings/wallet')
        revalidatePath('/dashboard')

        return { success: true }
    } catch (error: any) {
        console.error('❌ Wallet activation error:', error)
        return { success: false, message: error.message }
    }
}
