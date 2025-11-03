'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CreditCard } from 'lucide-react'
import { updatePaymentStatus } from '@/app/(dashboard)/orders/actions'

const PAYMENT_STATUSES = [
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'refunded', label: 'Refunded' },
]

const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'netbanking', label: 'Net Banking' },
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'wallet', label: 'Wallet' },
]

export function PaymentStatusUpdate({
  orderId,
  currentPaymentStatus,
  currentPaymentMethod,
}: {
  orderId: string
  currentPaymentStatus: string
  currentPaymentMethod?: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus)
  const [paymentMethod, setPaymentMethod] = useState(currentPaymentMethod || '')

  const handlePaymentUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (paymentStatus === currentPaymentStatus && paymentMethod === currentPaymentMethod) {
      toast({
        title: 'No changes',
        description: 'Payment details are already set to these values',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('orderId', orderId)
      formData.append('paymentStatus', paymentStatus)
      if (paymentMethod) {
        formData.append('paymentMethod', paymentMethod)
      }

      const result = await updatePaymentStatus(formData)

      if (result.success) {
        toast({
          title: 'Success ✅',
          description: result.message || 'Payment status updated successfully',
        })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update payment status',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <form onSubmit={handlePaymentUpdate} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="paymentStatus">Payment Status</Label>
        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
          <SelectTrigger id="paymentStatus">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method (Optional)</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger id="paymentMethod">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Update Payment
          </>
        )}
      </Button>
    </form>
  )
}