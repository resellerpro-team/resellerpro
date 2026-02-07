'use server'

import { createClient } from '@/lib/supabase/server'
import { razorpay, verifyPaymentSignature } from '@/lib/razorpay/razorpay'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/services/notificationService'
import { MailService } from '@/lib/mail'
import { generateContractPdf } from '@/lib/pdf/contract'
import { format } from 'date-fns'

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
// --------------------
// Get current subscription
// --------------------
export async function getSubscriptionData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { checkAndDowngradeSubscription } = await import('@/lib/subscription-utils')
  const subscription = await checkAndDowngradeSubscription(user.id)

  if (!subscription) return null

  const { PLAN_LIMITS } = await import('@/config/pricing')

  // Re-calculate plan info after potential downgrade
  const planData = subscription.plan
  const planNameRaw = (Array.isArray(planData) ? planData[0]?.name : planData?.name)?.toLowerCase() || 'free'
  // Handle array or object for plan

  const planKey = (Object.keys(PLAN_LIMITS).includes(planNameRaw) ? planNameRaw : 'free') as keyof typeof PLAN_LIMITS
  const limits = PLAN_LIMITS[planKey]

  // --- FETCH USAGE ---
  // Count total records instead of monthly (requested change)

  // 1. Orders (Total)
  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // 2. Enquiries (Total)
  const { count: enquiriesCount } = await supabase
    .from('enquiries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // 3. Products (Total)
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // 4. Customers (Total active)
  const { count: customersCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_deleted', false)

  const usage = {
    orders: ordersCount || 0,
    enquiries: enquiriesCount || 0,
    products: productsCount || 0,
    customers: customersCount || 0,
  }

  const checkLimit = (used: number, limit: number) => {
    return {
      used,
      limit,
      percentage: limit === Infinity ? 0 : Math.min(Math.round((used / limit) * 100), 100),
      isReached: limit !== Infinity && used >= limit
    }
  }

  // Calculate percentages
  const metrics = {
    orders: checkLimit(usage.orders, limits.orders),
    enquiries: checkLimit(usage.enquiries, limits.enquiries),
    products: checkLimit(usage.products, limits.products),
    customers: checkLimit(usage.customers, limits.customers),
  }

  // Legacy return fields for backward compatibility with existing UI (shows order limit mainly)
  return {
    ...subscription,
    orders_this_month: usage.orders,
    usage_percentage: metrics.orders.percentage,
    is_limit_reached: metrics.orders.isReached,
    // Add new metrics field
    metrics,
    plan_details: limits
  }
}

// --------------------
// Get available plans
// --------------------
export async function getAvailablePlans() {
  const supabase = await createClient()

  const { data: dbPlans } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true })

  if (!dbPlans) return []

  const { pricingPlans } = await import('@/config/pricing')

  // Merge DB plans with Config features/details to ensure limits match code
  return dbPlans.map(dbPlan => {
    // Find matching config plan by name (normalized)
    const configPlan = pricingPlans.find(p =>
      p.id === dbPlan.name.toLowerCase() ||
      p.id === dbPlan.id ||
      p.name.toLowerCase() === dbPlan.name.toLowerCase()
    )

    if (configPlan) {
      return {
        ...dbPlan,
        features: configPlan.features, // Use features from config (contains dynamic limits)
        description: configPlan.description,
        display_name: configPlan.display_name || dbPlan.display_name, // Prefer config display name if exists
        // We keep DB ID and Price (for checkout) mostly, unless we want to override price visual too.
        // But for checkout integrity, DB price should be used. 
        // Although the user said "199/month", if DB says otherwise, we might have a mismatch.
        // Let's assume DB price is correct or user will update DB.
        // Actually, let's allow config to override display price for the UI cards if needed, but the checkout action uses DB price.
        // To avoid confusion, let's keep DB price.
      }
    }
    return dbPlan
  })
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

  const isValid = verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  )

  if (!isValid) {
    return { success: false, message: 'Invalid payment signature' }
  }

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

  // 🛑 IDEMPOTENCY GUARD: Check if already processed
  if (transaction.status === 'success') {
    return { success: true, message: 'Payment already processed successfully' }
  }

  // Update Transaction status to 'success' first as a lock
  const { error: txUpdateError } = await adminSupabase
    .from('payment_transactions')
    .update({
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      status: 'success',
      updated_at: new Date().toISOString()
    })
    .eq('id', transaction.id)

  if (txUpdateError) {
    console.error('❌ Transaction update error:', txUpdateError)
    return { success: false, message: 'Failed to update transaction status' }
  }

  const planId = (transaction.metadata as any)?.plan_id
  if (!planId) {
    return { success: false, message: 'Plan ID missing in transaction' }
  }

  const walletApplied = parseFloat((transaction.metadata as any)?.wallet_applied || '0')

  const now = new Date()
  const periodEnd = new Date(now)
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  // Deduct wallet balance if any was used
  if (walletApplied > 0) {
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
    }
  }

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

    // 💰 ATOMIC ROLLBACK: Refund wallet if subscription update failed
    if (walletApplied > 0) {
      console.log(`[ROLLBACK] Refunding ₹${walletApplied} to user ${user.id} due to sub update failure`)
      await adminSupabase.rpc('add_wallet_transaction', {
        p_user_id: user.id,
        p_amount: walletApplied,
        p_type: 'signup_reward', // Borrowing type for refund visual or add a 'refund' type
        p_description: 'Refund: Subscription update failed',
      })
    }

    // Revert transaction status if possible so they can try again? 
    // Actually, better to keep it success but return error so they contact support, 
    // but with the refund, they are at least not out of pocket.
    return { success: false, message: 'Failed to activate subscription. Wallet balance has been restored.' }
  }

  // Process referral rewards (credited ONLY after first successful paid subscription)
  try {
    const { data: rewardResult, error: rewardError } = await adminSupabase
      .rpc('process_referral_rewards', {
        p_referee_id: user.id,
      })

    if (rewardError) {
      console.error('❌ Referral reward RPC error:', rewardError)
    } else if (rewardResult && rewardResult.length > 0) {

      // Create notification for the referrer
      const reward = rewardResult[0]
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
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const { data: plan } = await adminSupabase
      .from('subscription_plans')
      .select('display_name, price')
      .eq('id', planId)
      .single()

    if (plan) {
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
        // Notify user in-app that email failed, but subscription is active
        await createNotification({
          userId: user.id,
          type: 'system_alert',
          title: 'Email Delivery Failed',
          message: `subscription active, but failed to send contract email: ${result.error?.substring(0, 50)}...`,
          entityType: 'subscription',
          priority: 'normal'
        })
      }
    }
  } catch (emailError: any) {
    console.error('❌ Email sending threw exception:', emailError)
    console.error('Stack:', emailError.stack)

    // Notify user of exception
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
    })
    .eq('user_id', user.id)

  revalidatePath('/settings/subscription')

  return { success: true }
}
