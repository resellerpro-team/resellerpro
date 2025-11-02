import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, AlertCircle } from 'lucide-react'
import { getSubscription, getPlanDetails } from './actions'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const metadata = {
  title: 'Subscription - ResellerPro',
}

export default async function SubscriptionPage() {
  const subscription = await getSubscription()
  const plans = await getPlanDetails()

  if (!subscription) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            Unable to load subscription data.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Format renewal date
  const renewalDate = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not set'

  const isPro = subscription.plan_name === 'professional'
  const isLimitWarning = subscription.usage_percentage >= 80

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Manage your subscription and billing details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 border rounded-lg bg-muted/50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Your Current Plan:{' '}
                  <span className="text-primary capitalize">
                    {subscription.plan_name}
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isPro ? 'Unlimited orders' : `Renews on ${renewalDate}`}
                </p>
              </div>
              <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                {subscription.status}
              </Badge>
            </div>

            {!isPro && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Orders this month</span>
                  <span>
                    {subscription.orders_this_month} / {subscription.monthly_order_limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      subscription.is_limit_reached
                        ? 'bg-red-500'
                        : isLimitWarning
                        ? 'bg-yellow-500'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(subscription.usage_percentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {subscription.is_limit_reached ? (
                    <span className="text-red-600 font-medium">
                      ⚠️ Limit reached! Upgrade to create more orders.
                    </span>
                  ) : (
                    `You've used ${subscription.usage_percentage}% of your free orders. Upgrade for unlimited!`
                  )}
                </p>
              </div>
            )}
          </div>

          {subscription.is_limit_reached && !isPro && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You've reached your monthly limit of {subscription.monthly_order_limit} orders.
                Upgrade to Professional for unlimited orders.
              </AlertDescription>
            </Alert>
          )}

          {!isPro && (
            <>
              <div className="space-y-2">
                <h3 className="font-semibold">Upgrade to unlock more features</h3>
                <p className="text-sm text-muted-foreground">
                  Get unlimited orders, WhatsApp automation, and priority support.
                </p>
              </div>

              <div className="space-y-3">
                {plans.professional.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button size="lg" className="w-full gap-2">
                <Zap className="h-4 w-4" />
                Upgrade to Professional - ₹{plans.professional.price}/month
              </Button>
            </>
          )}

          {isPro && (
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-900 dark:text-green-100">
                  You're on the Professional plan with unlimited orders!
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center text-sm border-t pt-6">
          <p className="text-muted-foreground">Need to cancel?</p>
          <Button variant="destructive" size="sm" disabled={!isPro}>
            Cancel Subscription
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}