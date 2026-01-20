
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2 } from 'lucide-react'
import { createCheckoutSession } from '@/app/(dashboard)/settings/subscription/actions'
import { activateWithWallet } from '@/app/(dashboard)/settings/subscription/walletActions'
import { PaymentMethodDialog } from './PaymentMethodDialog'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

type Plan = {
  id: string
  name: string
  display_name: string
  price: number
  offer_price: number | null
  order_limit: number | null
  tag_line: string | null
  features: any[]
}

type PricingCardsProps = {
  plans: Plan[]
  currentPlanName: string
  walletBalance: number
}

export function PricingCards({ plans, currentPlanName, walletBalance }: PricingCardsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const handleUpgradeClick = (plan: Plan) => {
    setSelectedPlan(plan)
    setShowPaymentDialog(true)
  }

  const handlePaymentMethodSelected = async (method: 'wallet' | 'razorpay' | 'wallet+razorpay') => {
    if (!selectedPlan) return

    setIsLoading(true)
    setShowPaymentDialog(false)

    try {
      if (method === 'wallet') {
        // Pay with wallet only
        const result = await activateWithWallet(selectedPlan.id)

        if (result.success) {
          toast({
            title: 'Subscription Activated! 🎉',
            description: `You're now on the ${selectedPlan.display_name} plan.`,
          })
          router.refresh()
        } else {
          toast({
            title: 'Activation Failed',
            description: result.message,
            variant: 'destructive',
          })
        }
      } else if (method === 'razorpay' || method === 'wallet+razorpay') {
        // Create checkout session (handles both Razorpay only and Wallet+Razorpay)
        const session = await createCheckoutSession(selectedPlan.id)

        if (!session.success) {
          toast({
            title: 'Checkout Failed',
            description: session.message,
            variant: 'destructive',
          })
          setIsLoading(false)
          return
        }

        // If wallet covers everything (shouldn't happen with this method, but just in case)
        if (session.useWalletOnly) {
          const result = await activateWithWallet(selectedPlan.id)

          if (result.success) {
            toast({
              title: 'Subscription Activated! 🎉',
              description: `You're now on the ${selectedPlan.display_name} plan.`,
            })
            router.refresh()
          }
          setIsLoading(false)
          return
        }

        // Open Razorpay checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: session.amount,
          currency: session.currency,
          name: 'ResellerPro',
          description: `${session.planName} Subscription`,
          order_id: session.orderId,
          prefill: session.customerDetails,
          theme: {
            color: '#3b82f6',
          },
          handler: async function (response: any) {
            const { verifyPaymentAndActivate } = await import(
              '@/app/(dashboard)/settings/subscription/actions'
            )

            const result = await verifyPaymentAndActivate(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            )

            if (result.success) {
              toast({
                title: 'Payment Successful! 🎉',
                description: `You're now on the ${selectedPlan.display_name} plan.`,
              })
              router.refresh()
            } else {
              toast({
                title: 'Payment Verification Failed',
                description: result.message,
                variant: 'destructive',
              })
            }
            setIsLoading(false)
          },
          modal: {
            ondismiss: function () {
              toast({
                title: 'Payment Cancelled',
                description: 'You can try again anytime.',
              })
              setIsLoading(false)
            },
          },
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.name === currentPlanName
          const isPopular = plan.name === 'professional'

          return (
            <Card
              key={plan.id}
              className={`relative ${isPopular ? 'border-primary shadow-lg' : ''
                }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <Badge className="px-3 py-1">Most Popular</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
                <CardDescription>
                  {isCurrentPlan ? (
                    <div className="mt-4">
                      <span className="text-3xl text-foreground me-2">₹{plan.price}</span>
                      <span className="text-xl text-foreground">/month</span>
                    </div>
                  ) : plan.name === 'free' ? (
                    <div className="mt-4">
                      <span className="text-3xl text-foreground me-2">₹{plan.price}</span>
                      <span className="text-xl text-foreground">/month</span>
                    </div>
                  ) : (plan.offer_price != null ? (
                    <div className="mt-4">
                      <span className="text-3xl text-muted-foreground  line-through me-2">₹{plan.price}</span>
                      <span className="text-3xl text-foreground ">₹{plan.offer_price}</span>
                      <span className="text-xl text-foreground">/month</span>
                    </div>
                  ) : (<div className="mt-4">
                    <span className="text-2xl text-foreground me-2">₹{plan.price}</span>
                    <span className="text-xl text-foreground">/month</span>
                  </div>)

                  )}
                  <div className="mt-2 mb-1 h-6">
                    <span className="text-foreground font-semibold">{plan.tag_line}</span>
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent>
                {isCurrentPlan ? (
                  <Button className="w-full mb-4 " disabled>
                    Current Plan
                  </Button>
                ) : plan.name === 'free' ? (
                  <Button className="w-full mb-4 text-primary " variant="secondary" disabled>
                    Starts at end of current plan
                  </Button>
                ) : (
                  <Button
                    className="w-full mb-4 "
                    onClick={() => handleUpgradeClick(plan)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Upgrade Now'
                    )}
                  </Button>
                )}

                <ul className="space-y-3">
                  {(plan.features as string[]).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>


            </Card>
          )
        })}
      </div>

      {/* Payment Method Selection Dialog */}
      {selectedPlan && (
        <PaymentMethodDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          planName={selectedPlan.display_name}
          planPrice={selectedPlan.offer_price == null ? selectedPlan.price : selectedPlan.offer_price}
          walletBalance={walletBalance}
          onConfirm={handlePaymentMethodSelected}
          isLoading={isLoading}
        />
      )}
    </>
  )
}
