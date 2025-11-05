'use server'

import { createClient } from '@/lib/supabase/server'
import { razorpay, verifyPaymentSignature, isMockMode } from '@/lib/razorpay/razorpay'
import { revalidatePath } from 'next/cache'

// ✅ Helper: Ensure subscription exists
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

  await supabase
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      plan_id: freePlan.id,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: futureDate.toISOString(),
    })
}

export async function getSubscriptionData() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  await ensureSubscriptionExists(user.id)

  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('user_id', user.id)
    .single()

  if (!subscription) return null

  // ✅ Get current month start
  const periodStart = new Date()
  periodStart.setDate(1)
  periodStart.setHours(0, 0, 0, 0)

  // ✅ Count orders directly from orders table (more reliable)
  const { count: ordersThisMonth } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', periodStart.toISOString())

  const orderCount = ordersThisMonth || 0
  const orderLimit = subscription.plan?.order_limit || 0
  const usagePercentage = orderLimit > 0 ? Math.round((orderCount / orderLimit) * 100) : 0

  console.log('📊 Subscription Debug:', {
    userId: user.id,
    planName: subscription.plan?.name,
    orderLimit,
    ordersThisMonth: orderCount,
    usagePercentage,
    periodStart: periodStart.toISOString(),
  })

  return {
    ...subscription,
    orders_this_month: orderCount,
    usage_percentage: usagePercentage,
    is_limit_reached: orderLimit > 0 && orderCount >= orderLimit,
  }
}

export async function getAvailablePlans() {
  const supabase = await createClient()
  
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true })

  return plans || []
}

export async function createCheckoutSession(planId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Not authenticated' }
  }

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
      .select('full_name, phone')
      .eq('id', user.id)
      .single()

    const order = await razorpay.orders.create({
      amount: Math.round(plan.price * 100),
      currency: 'INR',
      receipt: `sub_${Date.now()}`,
      notes: {
        user_id: user.id,
        plan_id: planId,
        plan_name: plan.name,
      },
    })

    // ✅ Save transaction with proper metadata
    const { data: transaction } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        razorpay_order_id: order.id,
        amount: plan.price,
        currency: 'INR',
        status: 'pending',
        metadata: { 
          plan_id: planId, 
          plan_name: plan.name 
        },
      })
      .select()
      .single()

    console.log('✅ Transaction created:', transaction)

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      customerDetails: {
        name: profile?.full_name || 'User',
        email: user.email,
        contact: profile?.phone || '',
      },
      planName: plan.display_name,
      planPrice: plan.price,
      isMock: isMockMode(),
    }
  } catch (error: any) {
    console.error('❌ Checkout error:', error)
    return { success: false, message: error.message }
  }
}

export async function verifyPaymentAndActivate(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Not authenticated' }
  }

  try {
    console.log('🔍 Verifying payment:', {
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      isMock: isMockMode(),
    })

    // ✅ Verify signature
    const isValid = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    )

    console.log('✅ Signature valid:', isValid)

    if (!isValid) {
      return { success: false, message: 'Invalid payment signature' }
    }

    // ✅ Get transaction
    const { data: transaction, error: txError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('razorpay_order_id', razorpayOrderId)
      .eq('user_id', user.id)
      .single()

    console.log('📄 Transaction found:', transaction)
    console.log('❌ Transaction error:', txError)

    if (!transaction) {
      return { success: false, message: 'Transaction not found' }
    }

    // ✅ Update transaction
    await supabase
      .from('payment_transactions')
      .update({
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        status: 'success',
      })
      .eq('id', transaction.id)

    console.log('✅ Transaction updated to success')

    // ✅ Get plan ID from metadata
    const metadata = transaction.metadata as any
    const planId = metadata?.plan_id

    if (!planId) {
      return { success: false, message: 'Plan ID not found in transaction' }
    }

    // ✅ Update subscription
    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    const { error: subError } = await supabase
      .from('user_subscriptions')
      .update({
        plan_id: planId,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
      })
      .eq('user_id', user.id)

    console.log('✅ Subscription updated')
    console.log('❌ Subscription error:', subError)

    if (subError) {
      return { success: false, message: 'Failed to update subscription: ' + subError.message }
    }

    revalidatePath('/settings/subscription')
    revalidatePath('/dashboard')

    return { success: true, message: 'Subscription activated successfully!' }
  } catch (error: any) {
    console.error('❌ Payment verification error:', error)
    return { success: false, message: error.message }
  }
}

export async function cancelSubscription() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'Not authenticated' }
  }

  try {
    const { data: freePlan } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('name', 'free')
      .single()

    if (!freePlan) {
      return { success: false, message: 'Free plan not found' }
    }

    const now = new Date()
    const futureDate = new Date(now)
    futureDate.setFullYear(futureDate.getFullYear() + 10)

    await supabase
      .from('user_subscriptions')
      .update({
        plan_id: freePlan.id,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: futureDate.toISOString(),
        cancel_at_period_end: false,
        razorpay_subscription_id: null,
      })
      .eq('user_id', user.id)

    revalidatePath('/settings/subscription')

    return { success: true, message: 'Subscription cancelled. You are now on the Free plan.' }
  } catch (error: any) {
    console.error('Cancel error:', error)
    return { success: false, message: error.message }
  }
}