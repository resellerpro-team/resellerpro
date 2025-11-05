'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, CreditCard, Smartphone, Building2, X, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { verifyPaymentAndActivate } from '@/app/(dashboard)/settings/subscription/actions'

export function MockPaymentDialog({
  orderId,
  amount,
  planName,
  onClose,
}: {
  orderId: string
  amount: number
  planName: string
  onClose: () => void
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'select' | 'processing' | 'success' | 'failed'>('select')
  const [errorMessage, setErrorMessage] = useState('')

  const processPayment = async (shouldSucceed: boolean) => {
    setLoading(true)
    setStep('processing')
    setErrorMessage('')

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    if (shouldSucceed) {
      try {
        // ✅ Generate unique mock IDs
        const mockPaymentId = `pay_MOCK${Date.now()}${Math.random().toString(36).substr(2, 9)}`
        const mockSignature = `sig_MOCK${Date.now()}${Math.random().toString(36).substr(2, 9)}`

        console.log('🧪 Mock Payment Data:', {
          orderId,
          paymentId: mockPaymentId,
          signature: mockSignature,
        })

        const result = await verifyPaymentAndActivate(
          orderId,
          mockPaymentId,
          mockSignature
        )

        console.log('📊 Payment Result:', result)

        if (result.success) {
          setStep('success')
          toast({
            title: '✅ Payment Successful!',
            description: `You've been upgraded to ${planName}`,
          })
          
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        } else {
          setStep('failed')
          setErrorMessage(result.message)
          toast({
            title: 'Payment Failed',
            description: result.message,
            variant: 'destructive',
          })
          setLoading(false)
        }
      } catch (error: any) {
        console.error('❌ Payment error:', error)
        setStep('failed')
        setErrorMessage(error.message || 'Unknown error occurred')
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
        setLoading(false)
      }
    } else {
      setStep('failed')
      setErrorMessage('Payment declined by bank')
      toast({
        title: 'Payment Failed',
        description: 'Transaction was declined',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="max-w-lg w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle>Test Payment Checkout</CardTitle>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  🧪 Mock Mode
                </Badge>
              </div>
              <CardDescription>
                Simulate payment without actual transaction
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-semibold">{planName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order ID</span>
              <code className="text-xs bg-background px-2 py-1 rounded font-mono">
                {orderId}
              </code>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="font-semibold">Amount to Pay</span>
              <span className="text-2xl font-bold text-primary">₹{amount}</span>
            </div>
          </div>

          {/* Processing State */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <div className="text-center space-y-1">
                <p className="font-semibold">Processing Payment...</p>
                <p className="text-sm text-muted-foreground">Please wait, do not close this window</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="h-16 w-16 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xl font-bold text-green-600 dark:text-green-400">Payment Successful!</p>
                <p className="text-sm text-muted-foreground">Activating your subscription...</p>
              </div>
            </div>
          )}

          {/* Failed State */}
          {step === 'failed' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="h-16 w-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">Payment Failed</p>
                  {errorMessage && (
                    <p className="text-sm text-muted-foreground max-w-sm">
                      {errorMessage}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('select')}
                >
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Payment Method Selection */}
          {step === 'select' && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-3">Choose Test Scenario</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Click any payment method below to simulate that flow
                </p>
              </div>

              <div className="space-y-2">
                {/* Success - Cards */}
                <button
                  onClick={() => processPayment(true)}
                  disabled={loading}
                  className="w-full p-4 border-2 border-green-200 hover:border-green-400 bg-green-50/50 hover:bg-green-50 dark:bg-green-950/20 dark:hover:bg-green-950/40 rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-green-900 dark:text-green-100">
                          ✅ Credit/Debit Card (Success)
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                        Card: 4111 1111 1111 1111 • CVV: 123
                      </p>
                    </div>
                  </div>
                </button>

                {/* Success - UPI */}
                <button
                  onClick={() => processPayment(true)}
                  disabled={loading}
                  className="w-full p-4 border-2 border-green-200 hover:border-green-400 bg-green-50/50 hover:bg-green-50 dark:bg-green-950/20 dark:hover:bg-green-950/40 rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-green-900 dark:text-green-100">
                          ✅ UPI (Success)
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                        UPI ID: success@razorpay
                      </p>
                    </div>
                  </div>
                </button>

                {/* Failure Scenario */}
                <button
                  onClick={() => processPayment(false)}
                  disabled={loading}
                  className="w-full p-4 border-2 border-red-200 hover:border-red-400 bg-red-50/50 hover:bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                      <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-red-900 dark:text-red-100">
                          ❌ Failed Payment
                        </span>
                      </div>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                        Test failure scenario (insufficient funds)
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>💡 Mock Mode:</strong> No real money will be charged. This simulates the payment flow for testing. Check your browser console for detailed logs.
                </p>
              </div>

              {/* Cancel */}
              <Button
                variant="outline"
                className="w-full"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}