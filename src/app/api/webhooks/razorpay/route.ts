import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
    try {
        const body = await req.text()
        const signature = req.headers.get('x-razorpay-signature')
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET

        if (!signature || !secret) {
            console.error('❌ Razorpay Webhook: Missing signature or secret')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex')

        if (expectedSignature !== signature) {
            console.error('❌ Razorpay Webhook: Invalid signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        const payload = JSON.parse(body)
        const event = payload.event

        console.log(`[RAZORPAY WEBHOOK] Received event: ${event}`)

        // Handle payment success events
        if (event === 'order.paid' || event === 'payment.captured') {
            const orderId = payload.payload.payment?.entity?.order_id || payload.payload.order?.entity?.id

            if (!orderId) {
                console.error('❌ Razorpay Webhook: Order ID not found in payload')
                return NextResponse.json({ error: 'Order ID not found' }, { status: 400 })
            }

            const adminSupabase = await createAdminClient()

            // 1. Find the transaction
            const { data: transaction, error: fetchErr } = await adminSupabase
                .from('payment_transactions')
                .select('*')
                .eq('razorpay_order_id', orderId)
                .single()

            if (fetchErr || !transaction) {
                console.log(`[RAZORPAY WEBHOOK] Transaction ${orderId} not found in database. Skipping.`)
                return NextResponse.json({ message: 'Transaction not found, ignoring' }, { status: 200 })
            }

            // 2. IDEMPOTENCY: Check if already processed
            if (transaction.status === 'success') {
                console.log(`[RAZORPAY WEBHOOK] Transaction ${orderId} already successful. Skipping.`)
                return NextResponse.json({ message: 'Already processed' }, { status: 200 })
            }

            console.log(`[RAZORPAY WEBHOOK] Activating subscription for user ${transaction.user_id} via Webhook`)

            // 3. Mark transaction as success
            await adminSupabase
                .from('payment_transactions')
                .update({ status: 'success', updated_at: new Date().toISOString() })
                .eq('id', transaction.id)

            const metadata = transaction.metadata as any
            const planId = metadata?.plan_id
            const walletApplied = parseFloat(metadata?.wallet_applied || '0')
            const userId = transaction.user_id

            if (!planId || !userId) {
                console.error('❌ Razorpay Webhook: Missing metadata in transaction')
                return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
            }

            // 4. Activate Subscription
            const now = new Date()
            const periodEnd = new Date(now)
            periodEnd.setMonth(periodEnd.getMonth() + 1)

            // Use a RPC or direct update
            const { error: subError } = await adminSupabase
                .from('user_subscriptions')
                .update({
                    plan_id: planId,
                    status: 'active',
                    current_period_start: now.toISOString(),
                    current_period_end: periodEnd.toISOString(),
                    cancel_at_period_end: false,
                })
                .eq('user_id', userId)

            if (subError) {
                console.error('❌ Razorpay Webhook: Failed to update subscription:', subError)
                // Here we could retry or just leave it for support, 
                // but we've already marked the payment as success.
            } else {
                // 5. Deduct wallet if any was applied
                if (walletApplied > 0) {
                    await adminSupabase.rpc('add_wallet_transaction', {
                        p_user_id: userId,
                        p_amount: -walletApplied,
                        p_type: 'subscription_debit',
                        p_description: 'Subscription payment (Webhook recovered)',
                    })
                }

                // 6. Process Referral Rewards
                await adminSupabase.rpc('process_referral_rewards', {
                    p_referee_id: userId,
                })

                console.log(`✅ [RAZORPAY WEBHOOK] Successfully activated plan for user ${userId}`)
            }
        }

        return NextResponse.json({ received: true }, { status: 200 })
    } catch (error: any) {
        console.error('❌ Razorpay Webhook Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
