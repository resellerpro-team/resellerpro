'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/services/notificationService'
import { MailService } from '@/lib/mail'
import { generateContractPdf } from '@/lib/pdf/contract'
import { format } from 'date-fns'

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
            .select('wallet_balance, is_referral_rewarded, full_name')
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

        // Process referral rewards (CRITICAL: This credits the referrer)
        try {
            const { data: rewardData, error: rewardError } = await adminSupabase
                .rpc('process_referral_rewards', {
                    p_referee_id: user.id,
                })

            if (rewardError) {
                console.error('❌ Referral reward RPC error:', rewardError)
            } else if (rewardData && rewardData.length > 0) {

                // Create notification for the referrer
                const reward = rewardData[0]
                await createNotification({
                    userId: reward.referrer_id,
                    type: 'wallet_credited',
                    title: 'Wallet credited',
                    message: `₹${reward.amount} added to your wallet (Referral reward)`,
                    entityType: 'wallet',
                    priority: 'low',
                })
            }
        } catch (rewardError: any) {
            console.error('❌ Referral reward exception:', rewardError.message)
            // Don't fail subscription if referral reward fails
        }

        // --------------------
        // Send Confirmation Email
        // --------------------
        try {
            const pdfBuffer = await generateContractPdf({
                userName: profile?.full_name || 'Valued User',
                planName: plan.display_name,
                amount: plan.price,
                startDate: format(now, 'dd MMM yyyy'),
                endDate: format(periodEnd, 'dd MMM yyyy'),
            })


            const result = await MailService.sendSubscriptionConfirmation(
                user.email!,
                profile?.full_name || 'User',
                plan.display_name,
                format(periodEnd, 'dd MMM yyyy'),
                pdfBuffer
            )

            if (result.success) {
            } else {
                // Notify user in-app
                await createNotification({
                    userId: user.id,
                    type: 'system_alert',
                    title: 'Email Delivery Failed',
                    message: `Subscription active, but failed to send contract email: ${result.error?.substring(0, 50)}...`,
                    entityType: 'subscription',
                    priority: 'normal'
                })
            }
        } catch (emailError: any) {
            await createNotification({
                userId: user.id,
                type: 'system_alert',
                title: 'System Error',
                message: 'Failed to generate contract or send email. Please contact support.',
                entityType: 'subscription',
                priority: 'high'
            })
        }

        revalidatePath('/settings/subscription')
        revalidatePath('/settings/wallet')
        revalidatePath('/settings/referrals')
        revalidatePath('/dashboard')

        return { success: true }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}