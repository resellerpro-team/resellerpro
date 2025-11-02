'use server'

import { createClient } from '@/lib/supabase/server'

export type SubscriptionData = {
  plan_name: string
  status: string
  monthly_order_limit: number
  orders_this_month: number
  current_period_end: string | null
  razorpay_subscription_id: string | null
  usage_percentage: number
  is_limit_reached: boolean
}

/**
 * Get current user's subscription data
 */
export async function getSubscription(): Promise<SubscriptionData | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching subscription:', error)
    return null
  }

  // Calculate usage percentage
  const usagePercentage = subscription.monthly_order_limit > 0
    ? Math.round((subscription.orders_this_month / subscription.monthly_order_limit) * 100)
    : 0

  const isLimitReached = subscription.orders_this_month >= subscription.monthly_order_limit

  return {
    plan_name: subscription.plan_name,
    status: subscription.status,
    monthly_order_limit: subscription.monthly_order_limit,
    orders_this_month: subscription.orders_this_month,
    current_period_end: subscription.current_period_end,
    razorpay_subscription_id: subscription.razorpay_subscription_id,
    usage_percentage: usagePercentage,
    is_limit_reached: isLimitReached,
  }
}

/**
 * Check if user can create more orders
 */
export async function canCreateOrder(): Promise<{
  allowed: boolean
  reason?: string
}> {
  const subscription = await getSubscription()
  
  if (!subscription) {
    return { allowed: false, reason: 'Subscription not found' }
  }

  if (subscription.status !== 'active') {
    return { allowed: false, reason: 'Subscription is not active' }
  }

  if (subscription.orders_this_month >= subscription.monthly_order_limit) {
    return { 
      allowed: false, 
      reason: `Monthly limit of ${subscription.monthly_order_limit} orders reached. Please upgrade your plan.` 
    }
  }

  return { allowed: true }
}

/**
 * Get plan details (for upgrade options)
 */
export async function getPlanDetails() {
  return {
    free: {
      name: 'Free',
      price: 0,
      orderLimit: 10,
      features: [
        '10 orders per month',
        'Basic analytics',
        'Email support',
      ],
    },
    professional: {
      name: 'Professional',
      price: 499,
      orderLimit: -1, // Unlimited
      features: [
        'Unlimited orders',
        'Advanced analytics',
        'WhatsApp automation',
        'Priority support',
        'Custom branding',
      ],
    },
  }
}