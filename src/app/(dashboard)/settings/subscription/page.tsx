export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Check, TrendingUp, Zap, Package } from 'lucide-react'
import { getSubscriptionData, getAvailablePlans, cancelSubscription } from './actions'
import { PricingCards } from '@/components/subscription/PricingCards'
import { ActivePlanCard } from '@/components/subscription/ActivePlanCard'
import Script from 'next/script'

export const metadata = {
  title: 'Subscription - ResellerPro',
}

export default async function SubscriptionPage() {
  const subscription = await getSubscriptionData()
  const plans = await getAvailablePlans()

  // Get wallet balance (simple fetch from Supabase)
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let walletBalance = 0
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single()
    walletBalance = parseFloat(profile?.wallet_balance || '0')
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription and billing</p>
        </div>
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Unable to load subscription data. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isPro = subscription.plan?.name !== 'free'
  const isBusiness = subscription.plan?.name === 'business'
  const isLimitWarning = subscription.usage_percentage >= 80
  const hasOrderLimit = subscription.plan?.order_limit !== null

  return (
    <>
      {/* Razorpay Checkout Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing
          </p>
        </div>

        {/* Current Plan Card */}
        {isPro ? (
          <ActivePlanCard
            planName={subscription.plan?.display_name || 'Professional'}
            status={subscription.status}
            currentPeriodEnd={subscription.current_period_end}
            isBusiness={isBusiness}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Your active subscription details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan Overview */}
              <div className="p-6 border rounded-lg bg-muted/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold capitalize mb-1">
                      {subscription.plan?.display_name || 'Free Plan'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Free forever
                    </p>
                  </div>
                  <Badge
                    variant={subscription.status === 'active' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {subscription.status}
                  </Badge>
                </div>

                {/* Usage Bar (Only for free plan) */}
                {hasOrderLimit && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Orders this month</span>
                      <span className="font-semibold">
                        {subscription.orders_this_month} / {subscription.plan?.order_limit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${subscription.is_limit_reached
                          ? 'bg-red-500'
                          : isLimitWarning
                            ? 'bg-yellow-500'
                            : 'bg-primary'
                          }`}
                        style={{
                          width: `${Math.min(subscription.usage_percentage, 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {subscription.is_limit_reached ? (
                        <span className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Limit reached! Upgrade to create more orders.
                        </span>
                      ) : isLimitWarning ? (
                        <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                          ⚠️ You've used {subscription.usage_percentage}% of your monthly orders
                        </span>
                      ) : (
                        `You've used ${subscription.usage_percentage}% of your free orders`
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Limit Reached Alert */}
              {subscription.is_limit_reached && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You've reached your monthly limit of {subscription.plan?.order_limit} orders.
                    Upgrade to Professional for unlimited orders and advanced features.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {isPro ? 'Available Plans' : 'Upgrade Your Plan'}
            </h2>
            <p className="text-muted-foreground">
              {isPro
                ? 'Explore other subscription options'
                : 'Choose a plan that fits your business needs'}
            </p>
          </div>

          <PricingCards
            plans={plans}
            currentPlanName={subscription.plan?.name || 'free'}
            walletBalance={walletBalance}
          />
        </div>


        {/* Testimonial/Trust Section (Optional) */}
        {!isPro && (
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold mb-2">
                    Join 1,000+ successful resellers using Professional
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upgrade today and unlock unlimited growth potential for your business
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ or Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subscription FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-1">
                Can I cancel my subscription anytime?
              </h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel anytime. You'll continue to have access until the end of your billing period, then you'll be moved to the Free plan.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">
                What happens to my data if I cancel?
              </h4>
              <p className="text-sm text-muted-foreground">
                All your data (products, customers, orders) is preserved. You'll just be limited to the Free plan's order quota.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">
                Can I upgrade or downgrade my plan?
              </h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can change your plan at any time. Upgrades are instant, and downgrades take effect at the end of your billing cycle.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}