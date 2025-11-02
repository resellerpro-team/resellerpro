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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Truck } from 'lucide-react'
import { updateOrderStatus } from '@/app/(dashboard)/orders/actions'
const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function OrderStatusUpdate({
  orderId,
  currentStatus,
  orderNumber,
  customerName,
  customerPhone,
}: {
  orderId: string
  currentStatus: string
  orderNumber?: string
  customerName?: string
  customerPhone?: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [courierName, setCourierName] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedStatus === currentStatus) {
      toast({
        title: 'No changes',
        description: 'Status is already set to this value',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('orderId', orderId)
      formData.append('status', selectedStatus)
      
      if (selectedStatus === 'shipped') {
        formData.append('courierService', courierName)
        formData.append('trackingNumber', trackingNumber)
      }

      const result = await updateOrderStatus(formData)

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message || 'Order status updated successfully',
        })

        // Generate WhatsApp message
        if (customerPhone && orderNumber) {
          const message = generateStatusMessage(
            customerName || 'Customer',
            orderNumber,
            selectedStatus,
            trackingNumber,
            courierName
          )
          
          // Auto-open WhatsApp (optional)
          // window.open(`https://wa.me/${customerPhone}?text=${encodeURIComponent(message)}`, '_blank')
        }

        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update order status',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <form onSubmit={handleStatusUpdate} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status">Order Status</Label>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStatus === 'shipped' && (
        <div className="space-y-4 p-4 border rounded-md bg-muted/50 animate-in fade-in-50 duration-300">
          <div className="space-y-2">
            <Label htmlFor="courierName">Courier Name</Label>
            <Input
              id="courierName"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              placeholder="e.g., BlueDart, Delhivery, DTDC"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trackingNumber">Tracking Number</Label>
            <Input
              id="trackingNumber"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g., BD123456789"
            />
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || selectedStatus === currentStatus}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Truck className="mr-2 h-4 w-4" />
            Update Status
          </>
        )}
      </Button>

      {customerPhone && selectedStatus !== currentStatus && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            const message = generateStatusMessage(
              customerName || 'Customer',
              orderNumber || orderId,
              selectedStatus,
              trackingNumber,
              courierName
            )
            window.open(
              `https://wa.me/${customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
              '_blank'
            )
          }}
        >
          Send Update via WhatsApp
        </Button>
      )}
    </form>
  )
}

// Helper function to generate WhatsApp message
function generateStatusMessage(
  customerName: string,
  orderNumber: string,
  status: string,
  trackingNumber?: string,
  courierName?: string
): string {
  const statusMessages: Record<string, string> = {
    pending: `Hello ${customerName}! 👋\n\nYour order #${orderNumber} is pending confirmation. We'll update you soon!`,
    processing: `Hello ${customerName}! 👋\n\nGreat news! Your order #${orderNumber} is now being processed. We're getting it ready for shipment! 📦`,
    shipped: `Hello ${customerName}! 🎉\n\nYour order #${orderNumber} has been shipped!\n\n${
      courierName ? `📦 Courier: ${courierName}\n` : ''
    }${trackingNumber ? `🔢 Tracking: ${trackingNumber}\n` : ''}\nYou should receive it soon!`,
    delivered: `Hello ${customerName}! ✅\n\nYour order #${orderNumber} has been delivered! Hope you love it! 😊\n\nThank you for your business!`,
    cancelled: `Hello ${customerName},\n\nYour order #${orderNumber} has been cancelled. If you have any questions, please contact us.`,
  }

  return statusMessages[status] || `Order #${orderNumber} status updated to: ${status}`
}