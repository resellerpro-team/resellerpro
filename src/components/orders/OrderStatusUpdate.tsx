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
  orderItems = [],
  totalAmount = 0,
}: {
  orderId: string
  currentStatus: string
  orderNumber?: string
  customerName?: string
  customerPhone?: string
  orderItems?: string[]
  totalAmount?: number
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [courierName, setCourierName] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [showWhatsAppButton, setShowWhatsAppButton] = useState(false)
  const [lastUpdatedStatus, setLastUpdatedStatus] = useState('')

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
          title: 'Success ✅',
          description: result.message || 'Order status updated successfully',
        })

        // Show WhatsApp button after successful update
        setShowWhatsAppButton(true)
        setLastUpdatedStatus(selectedStatus)

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

  const handleWhatsAppSend = () => {
    const message = generateStatusMessage(
      customerName || 'Customer',
      orderNumber || orderId,
      lastUpdatedStatus || selectedStatus,
      trackingNumber,
      courierName,
      { products: orderItems, totalAmount }
    )
    window.open(
      `https://wa.me/${customerPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
      '_blank'
    )
    // Hide button after sending
    setShowWhatsAppButton(false)
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

      {customerPhone && showWhatsAppButton && (
        <Button
          type="button"
          variant="outline"
          className="w-full bg-green-50 hover:bg-green-100 border-green-500 text-green-700 animate-in fade-in-50 slide-in-from-top-2 duration-300"
          onClick={handleWhatsAppSend}
        >
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
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
  courierName?: string,
  orderDetails?: { products: string[]; totalAmount: number } | null
): string {
  const productList = orderDetails?.products?.length 
    ? `\n\n*YOUR ORDER INCLUDES:*\n${orderDetails.products.map(p => `   ${p}`).join('\n')}`
    : ''
  
  const amount = orderDetails?.totalAmount 
    ? `\n\n*Order Total:* Rs.${orderDetails.totalAmount.toFixed(2)}`
    : ''

  const statusMessages: Record<string, string> = {
    pending: `Hello ${customerName},

Thank you for choosing us! Your trust means everything to us.

━━━━━━━━━━━━━━━━━━━━━
*ORDER CONFIRMATION*
Order ID: #${orderNumber}${productList}${amount}
━━━━━━━━━━━━━━━━━━━━━

*CURRENT STATUS:* Pending Review

Your order is being carefully reviewed by our team. We'll confirm and begin processing within 24 hours.

You'll receive an update as soon as we start preparing your order.

_Need assistance? We're just a message away._

Warm regards,
Your Store Team`,
    
    processing: `Hello ${customerName},

Exciting news about your order!

━━━━━━━━━━━━━━━━━━━━━
*ORDER IN PROGRESS*
Order ID: #${orderNumber}${productList}${amount}
━━━━━━━━━━━━━━━━━━━━━

*CURRENT STATUS:* Processing

Your order is now in our fulfillment center and being carefully prepared for dispatch. Our team is ensuring everything is perfect before shipping.

*WHAT'S NEXT?*
We'll notify you immediately once your order is shipped with complete tracking details.

Thank you for your patience!

Warm regards,
Your Store Team`,
    
    shipped: `Hello ${customerName},

Your order is on its way to you!

━━━━━━━━━━━━━━━━━━━━━
*ORDER SHIPPED*
Order ID: #${orderNumber}${productList}${amount}
━━━━━━━━━━━━━━━━━━━━━

*CURRENT STATUS:* In Transit

*SHIPPING DETAILS:*${
      courierName ? `\nCourier Partner: ${courierName}` : ''
    }${
      trackingNumber ? `\nTracking ID: *${trackingNumber}*` : ''
    }

Your order has left our facility and is being delivered to your doorstep. Expected delivery: 3-5 business days.

${trackingNumber ? '_You can track your shipment in real-time using the tracking ID above._' : ''}

We hope you're as excited as we are!

Warm regards,
Your Store Team`,
    
    delivered: `Hello ${customerName},

Your order has been successfully delivered!

━━━━━━━━━━━━━━━━━━━━━
*DELIVERY COMPLETE*
Order ID: #${orderNumber}${productList}${amount}
━━━━━━━━━━━━━━━━━━━━━

*CURRENT STATUS:* Delivered

We hope you absolutely love your purchase! Your satisfaction is our top priority.

*WE VALUE YOUR FEEDBACK*
How was your experience? We'd love to hear from you.

_Any concerns? Our support team is here to help - just reply to this message._

Thank you for being an amazing customer!

With gratitude,
Your Store Team`,
    
    cancelled: `Hello ${customerName},

We're writing to inform you about your order cancellation.

━━━━━━━━━━━━━━━━━━━━━
*ORDER CANCELLED*
Order ID: #${orderNumber}${productList}${amount}
━━━━━━━━━━━━━━━━━━━━━

*CURRENT STATUS:* Cancelled

${orderDetails?.totalAmount ? `If you've already made a payment of Rs.${orderDetails.totalAmount.toFixed(2)}, it will be refunded to your original payment method within 5-7 business days.` : ''}

*WE'RE HERE TO HELP*
• Did you request this cancellation? No action needed.
• Unexpected cancellation? Please contact us immediately - we'll resolve this right away.
• Want to place a new order? We'd be delighted to assist you.

We truly appreciate your understanding and hope to serve you again soon.

_Questions? Reply to this message anytime._

Sincerely,
Your Store Team`,
  }

  return statusMessages[status] || `Order #${orderNumber} status updated to: ${status}`
}