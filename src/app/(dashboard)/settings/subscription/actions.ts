'use server'

import { createClient } from '@/lib/supabase/server'
import { razorpay, verifyPaymentSignature } from '@/lib/razorpay/razorpay'
import { revalidatePath } from 'next/cache'

// --------------------
// Helper: Ensure subscription exists
// --------------------
async function ensureSubscriptionExists(userId: string) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existing) return

  const { data: freePlan } = await supabase
    .from('subscription_plans')
    .select('id')
    .eq('name', 'free')
    .single()

  if (!freePlan) return

  const now = new Date()
  const futureDate = new Date(now)
  futureDate.setFullYear(futureDate.getFullYear() + 10)

  await supabase.from('user_subscriptions').insert({
    user_id: userId,
    plan_id: freePlan.id,
    status: 'active',
    current_period_start: now.toISOString(),
    current_period_end: futureDate.toISOString(),
  })
}

// --------------------
// Get current subscription
// --------------------
export async function getSubscriptionData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  await ensureSubscriptionExists(user.id)

  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select(`*, plan:subscription_plans(*)`)
    .eq('user_id', user.id)
    .single()

  if (!subscription) return null

  const periodStart = new Date()
  periodStart.setDate(1)
  periodStart.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', periodStart.toISOString())

  const orderCount = count || 0
  const orderLimit = subscription.plan?.order_limit || 0

  return {
    ...subscription,
    orders_this_month: orderCount,
    usage_percentage: orderLimit > 0 ? Math.round((orderCount / orderLimit) * 100) : 0,
    is_limit_reached: orderLimit > 0 && orderCount >= orderLimit,
  }
}

// --------------------
// Get available plans
// --------------------
export async function getAvailablePlans() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true })

  return data || []
}

// --------------------
// Create Razorpay Order
// --------------------
export async function createCheckoutSession(planId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Not authenticated' }

  try {
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (!plan) {
      return { success: false, message: 'Plan not found' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone, wallet_balance')
      .eq('id', user.id)
      .single()

    // Calculate wallet usage
    const walletBalance = parseFloat(profile?.wallet_balance || '0')
    const planPrice = plan.price
    const walletApplied = Math.min(walletBalance, planPrice)
    const payableAmount = planPrice - walletApplied

    // If wallet covers entire amount, return special flag
    if (payableAmount <= 0) {
      return {
        success: true,
        useWalletOnly: true,
        planId,
        planName: plan.display_name,
        totalPrice: planPrice,
        walletApplied: planPrice,
      }
    }

    // Create Razorpay order for remaining amount
    const order = await razorpay.orders.create({
      amount: Math.round(payableAmount * 100),
      currency: 'INR',
      receipt: `sub_${Date.now()}`,
      notes: {
        user_id: user.id,
        plan_id: planId,
        plan_name: plan.name,
        wallet_applied: walletApplied.toString(),
        total_price: planPrice.toString(),
      },
    })

    await supabase.from('payment_transactions').insert({
      user_id: user.id,
      razorpay_order_id: order.id,
      amount: payableAmount,
      currency: 'INR',
      status: 'pending',
      metadata: {
        plan_id: planId,
        plan_name: plan.name,
        wallet_applied: walletApplied,
        total_price: planPrice,
      },
    })

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.display_name,
      walletApplied,
      totalPrice: planPrice,
      customerDetails: {
        name: profile?.full_name || 'User',
        email: user.email!,
        contact: profile?.phone || '',
      },
    }
  } catch (error: any) {
    console.error('❌ Checkout error:', error)
    return { success: false, message: error.message }
  }
}

// --------------------
// Verify payment + activate subscription
// --------------------
export async function verifyPaymentAndActivate(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Not authenticated' }

  console.log('🔐 Verifying payment for user:', user.id)

  const isValid = verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  )

  if (!isValid) {
    return { success: false, message: 'Invalid payment signature' }
  }

  console.log('✅ Payment signature verified')

  // Use Admin Client for database updates to bypass RLS
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminSupabase = await createAdminClient()

  // Verify transaction ownership
  const { data: transaction, error: fetchErr } = await adminSupabase
    .from('payment_transactions')
    .select('*')
    .eq('razorpay_order_id', razorpayOrderId)
    .eq('user_id', user.id)
    .single()

  if (fetchErr || !transaction) {
    console.error('❌ Transaction fetch error:', fetchErr)
    return { success: false, message: 'Transaction not found' }
  }

  console.log('📄 Transaction found:', transaction.id)

  // Update Transaction
  const { error: txUpdateError } = await adminSupabase
    .from('payment_transactions')
    .update({
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      status: 'success',
    })
    .eq('id', transaction.id)

  if (txUpdateError) {
    console.error('❌ Transaction update error:', txUpdateError)
    return { success: false, message: 'Failed to update transaction' }
  }

  console.log('✅ Transaction updated')

  const planId = (transaction.metadata as any)?.plan_id
  if (!planId) {
    return { success: false, message: 'Plan ID missing in transaction' }
  }

  const walletApplied = parseFloat((transaction.metadata as any)?.wallet_applied || '0')

  console.log('💰 Wallet applied:', walletApplied)

  const now = new Date()
  const periodEnd = new Date(now)
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  // Deduct wallet balance if any was used
  if (walletApplied > 0) {
    console.log('💸 Deducting wallet:', walletApplied)

    const { error: walletError } = await adminSupabase
      .rpc('add_wallet_transaction', {
        p_user_id: user.id,
        p_amount: -walletApplied,
        p_type: 'subscription_debit',
        p_description: 'Subscription payment',
      })

    if (walletError) {
      console.error('❌ Wallet deduction error:', walletError)
      // Continue anyway, we don't want to fail the subscription
    } else {
      console.log('✅ Wallet deducted')
    }
  }

  // Update Subscription
  console.log('🔄 Updating subscription to plan:', planId)

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

  console.log('✅ Subscription updated')

  // Process referral rewards (credited ONLY after first successful paid subscription)
  console.log('🎁 Processing referral rewards...')

  try {
    const { data: rewardResult, error: rewardError } = await adminSupabase
      .rpc('process_referral_rewards', {
        p_referee_id: user.id,
      })

    if (rewardError) {
      console.error('❌ Referral reward RPC error:', rewardError)
    } else {
      console.log('✅ Referral rewards processed')
    }
  } catch (rewardError: any) {
    console.error('❌ Referral reward exception:', rewardError.message)
    // Don't fail subscription if referral reward fails
  }

  revalidatePath('/settings/subscription')
  revalidatePath('/settings/wallet')
  revalidatePath('/settings/referrals')
  revalidatePath('/dashboard')

  console.log('🎉 Payment verification completed')

  return { success: true }
}

// --------------------
// Cancel subscription
// --------------------
export async function cancelSubscription() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Not authenticated' }

  // Instead of immediate downgrade, we mark it to cancel at period end
  await supabase
    .from('user_subscriptions')
    .update({
      cancel_at_period_end: true,
      // We do NOT change plan_id or dates yet. 
      // A background job or check should handle the actual downgrade when current_period_end passes.
      // If the requirement implies strictly "keep access until end date", this is the correct way.
    })
    .eq('user_id', user.id)

  revalidatePath('/settings/subscription')

  return { success: true }
}
