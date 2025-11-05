export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Check, TrendingUp, Zap, Package } from 'lucide-react'
import { getSubscriptionData, getAvailablePlans, cancelSubscription } from './actions'
import { PricingCards } from '@/components/subscription/PricingCards'
import Script from 'next/script'

export const metadata = {
  title: 'Subscription - ResellerPro',
}

export default async function SubscriptionPage() {
  const subscription = await getSubscriptionData()
  const plans = await getAvailablePlans()

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
      {/* Load Razorpay Script (for when you switch to real mode) */}
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
                    {isPro
                      ? `Active until ${new Date(subscription.current_period_end).toLocaleDateString('en-IN', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}`
                      : 'Free forever'}
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
              {!isPro && hasOrderLimit && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Orders this month</span>
                    <span className="font-semibold">
                      {subscription.orders_this_month} / {subscription.plan?.order_limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        subscription.is_limit_reached
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

              {/* Pro Plan Active Message */}
              {isPro && (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      {isBusiness ? 'Business Plan Active' : 'Professional Plan Active'}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Unlimited orders & premium features enabled
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Limit Reached Alert */}
            {subscription.is_limit_reached && !isPro && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You've reached your monthly limit of {subscription.plan?.order_limit} orders.
                  Upgrade to Professional for unlimited orders and advanced features.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>

          {/* Cancel Subscription Footer (Only for paid plans) */}
          {isPro && (
            <CardFooter className="flex justify-between items-center border-t pt-6">
              <div>
                <p className="text-sm font-medium">Need to cancel?</p>
                <p className="text-xs text-muted-foreground">
                  You'll be downgraded to the Free plan
                </p>
              </div>
              <form
                action={async (formData: FormData) => {
                  await cancelSubscription();
                }}
              >
                <Button 
                  type="submit" 
                  variant="destructive" 
                  size="sm"
                >
                  Cancel Subscription
                </Button>
              </form>
            </CardFooter>
          )}
        </Card>

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
          />
        </div>

        {/* Why Upgrade Section (Only show for free users) */}
        {!isPro && (
          <Card>
            <CardHeader>
              <CardTitle>Why Upgrade to Professional?</CardTitle>
              <CardDescription>
                Unlock powerful features to scale your reselling business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Unlimited Orders</h4>
                    <p className="text-sm text-muted-foreground">
                      Process unlimited orders every month without any restrictions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">WhatsApp Automation</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically send order updates and invoices via WhatsApp
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Advanced Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Get detailed insights into your revenue, profit, and trends
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Priority Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Get help faster with dedicated priority customer support
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">PDF Invoice Generation</h4>
                    <p className="text-sm text-muted-foreground">
                      Create and share professional PDF invoices automatically
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Remove Branding</h4>
                    <p className="text-sm text-muted-foreground">
                      White-label experience with your own business branding
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                <div className="flex-shrink-0">
                  <Badge variant="secondary" className="text-sm px-4 py-2">
                    🧪 Mock Mode: Test payments enabled
                  </Badge>
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