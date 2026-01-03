'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  createCheckoutSession,
  verifyPaymentAndActivate,
} from '@/app/(dashboard)/settings/subscription/actions'

type Plan = {
  id: string
  name: string
  display_name: string
  price: number
  features: string[]
}

export function PricingCards({
  plans,
  currentPlanName,
}: {
  plans: Plan[]
  currentPlanName: string
}) {
  const { toast } = useToast()
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)

  const handleUpgrade = async (planId: string, plan: Plan) => {
    setLoadingPlanId(planId)

    try {
      const result = await createCheckoutSession(planId)

      if (!result.success) {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        })
        setLoadingPlanId(null)
        return
      }

      // ✅ Real Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: result.amount,
        currency: result.currency,
        name: 'ResellerPro',
        description: `Subscribe to ${result.planName}`,
        order_id: result.orderId,
        prefill: {
          name: result.customerDetails?.name ?? '',
          email: result.customerDetails?.email ?? '',
          contact: result.customerDetails?.contact ?? '',
        },
        theme: { color: '#000000' },

        handler: async function (response: any) {
          const verifyResult = await verifyPaymentAndActivate(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          )

          if (verifyResult.success) {
            toast({
              title: 'Success 🎉',
              description: 'Subscription activated successfully',
            })
            window.location.reload()
          } else {
            toast({
              title: 'Verification Failed',
              description: verifyResult.message,
              variant: 'destructive',
            })
          }
        },

        modal: {
          ondismiss: () => setLoadingPlanId(null),
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      })
      setLoadingPlanId(null)
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map((plan) => {
        const isCurrent = plan.name === currentPlanName
        const isPro = plan.name === 'professional'
        const isFree = plan.name === 'free'

        return (
          <Card
            key={plan.id}
            className={`relative ${isPro ? 'border-primary shadow-lg scale-105' : ''
              }`}
          >
            {isPro && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">Most Popular</Badge>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">₹{plan.price}</span>
                {!isFree && (
                  <span className="text-muted-foreground"> / month</span>
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {Array.isArray(plan.features) &&
                plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
            </CardContent>

            <CardFooter>
              {isCurrent ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : isFree ? (
                <Button variant="outline" className="w-full" disabled>
                  Free Forever
                </Button>
              ) : (
                <Button
                  className="w-full gap-2"
                  onClick={() => handleUpgrade(plan.id, plan)}
                  disabled={loadingPlanId === plan.id}
                >
                  {loadingPlanId === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Upgrade Now
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
