'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MessageCircle, CheckCircle2, CreditCard, Truck, Star, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type MessageTemplate = 'order_confirmation' | 'payment_reminder' | 'shipped_update' | 'delivered_confirmation' | 'follow_up'

interface WhatsAppOrderMessagesProps {
  orderNumber: string
  customerName: string
  customerPhone: string
  orderStatus: string
  paymentStatus: string
  totalAmount: string | number
  itemsText: string
  trackingNumber?: string
  courierService?: string
  shopName?: string
  expectedDeliveryDate?: string
}

export function WhatsAppOrderMessages({
  orderNumber,
  customerName,
  customerPhone,
  orderStatus,
  paymentStatus,
  totalAmount,
  itemsText,
  trackingNumber,
  courierService,
  shopName = 'Our Store',
  expectedDeliveryDate,
}: WhatsAppOrderMessagesProps) {
  const { toast } = useToast()
  const [sending, setSending] = useState(false)

  /**
   * Validates and formats phone number for WhatsApp
   * Accepts formats: 9876543210, +919876543210, +91 98765 43210
   * Returns: Valid international format or null
   */
  const formatWhatsAppNumber = (phone: string): string | null => {
    if (!phone) return null

    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '')

    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, '')

    // If starts with +, keep it
    if (cleaned.startsWith('+')) {
      // Must be at least 11 digits (+XX XXXXXXXXXX)
      if (cleaned.length >= 11) {
        return cleaned
      }
      return null
    }

    // If starts with 91 (India code), add +
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return `+${cleaned}`
    }

    // If 10 digits (Indian number without code), add +91
    if (cleaned.length === 10) {
      return `+91${cleaned}`
    }

    // If 11-15 digits, assume international with missing +
    if (cleaned.length >= 11 && cleaned.length <= 15) {
      return `+${cleaned}`
    }

    return null
  }

  /**
   * Get delivery date or estimate
   */
  const getDeliveryDate = (): string => {
    if (expectedDeliveryDate) {
      return new Date(expectedDeliveryDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }

    // Default: 5-7 days from now
    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + 6)
    return estimatedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  /**
   * Generate message based on template type
   */
  const generateMessage = (template: MessageTemplate): string => {
    const firstName = customerName.split(' ')[0]

    switch (template) {
      case 'order_confirmation':
        return `Hi ${firstName}! 👋

Your order #${orderNumber} has been confirmed! ✅

📦 *Order Details:*
${itemsText}

💰 *Total:* ₹${totalAmount}
🚚 *Expected Delivery:* ${getDeliveryDate()}

We'll keep you updated throughout the process!

Thank you for choosing ${shopName}! 🙏`

      case 'payment_reminder':
        return `Hi ${firstName}! 

Your order #${orderNumber} is ready to be processed! 📦

⚠️ *Pending Payment:* ₹${totalAmount}

Please complete the payment to proceed with shipping.

Need help? Reply to this message!

Thank you,
${shopName}`

      case 'shipped_update':
        return `Great news, ${firstName}! 📦✈️

Your order #${orderNumber} has been shipped!

${trackingNumber ? `
🔍 *Tracking Number:* ${trackingNumber}${courierService ? `
🚛 *Courier:* ${courierService}` : ''}

You can track your order in real-time!` : `
We'll share tracking details soon.`}

🎯 *Expected Delivery:* ${getDeliveryDate()}

Your order is on its way! 🚀

${shopName}`

      case 'delivered_confirmation':
        return `Hi ${firstName}! 🎉

Your order #${orderNumber} has been delivered successfully!

We hope you love your purchase! ✨

⭐ *Quick Feedback:*
How was your experience? Your feedback helps us serve you better!

Reply with: 
⭐⭐⭐⭐⭐ (1-5 stars)

Thank you for shopping with ${shopName}! 
We look forward to serving you again! 🙏`

      case 'follow_up':
        return `Hi ${firstName}! 👋

Thank you for your recent purchase with ${shopName}!

We hope you're enjoying your order! 😊

🆕 *New Arrivals:*
We've just added fresh stock! Check out our latest collection.

💬 *Need anything?*
Feel free to reach out - we're here to help!

Stay tuned for exclusive offers! 🎁

Best regards,
${shopName}`

      default:
        return ''
    }
  }

  /**
   * Send message via WhatsApp
   */
  const sendWhatsAppMessage = (template: MessageTemplate) => {
    setSending(true)

    try {
      // Validate phone number
      const formattedPhone = formatWhatsAppNumber(customerPhone)

      if (!formattedPhone) {
        toast({
          title: 'Invalid Phone Number',
          description: `Cannot send WhatsApp message. Phone: ${customerPhone || 'Not provided'}`,
          variant: 'destructive',
        })
        setSending(false)
        return
      }

      // Generate message
      const message = generateMessage(template)

      if (!message) {
        toast({
          title: 'Error',
          description: 'Failed to generate message template',
          variant: 'destructive',
        })
        setSending(false)
        return
      }

      // Encode message for URL
      const encodedMessage = encodeURIComponent(message)

      // Clean phone for WhatsApp (remove +)
      const whatsappPhone = formattedPhone.replace('+', '')

      // Construct WhatsApp URL
      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`

      // Open in new window
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')

      // Show success toast
      const templateNames = {
        order_confirmation: 'Order Confirmation',
        payment_reminder: 'Payment Reminder',
        shipped_update: 'Shipped Update',
        delivered_confirmation: 'Delivered Confirmation',
        follow_up: 'Follow-up Message',
      }

      toast({
        title: 'WhatsApp Opened',
        description: `${templateNames[template]} ready to send to ${customerName}`,
      })
    } catch (error) {
      console.error('WhatsApp send error:', error)
      toast({
        title: 'Error',
        description: 'Failed to open WhatsApp. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  // Check if phone number is valid
  const hasValidPhone = !!formatWhatsAppNumber(customerPhone)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full"
          disabled={sending || !hasValidPhone}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          {sending ? 'Opening...' : 'Send WhatsApp Update'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Choose Message Template</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => sendWhatsAppMessage('order_confirmation')}
          className="cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
          <span>Order Confirmation</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => sendWhatsAppMessage('payment_reminder')}
          className="cursor-pointer"
        >
          <CreditCard className="h-4 w-4 mr-2 text-yellow-600" />
          <span>Payment Reminder</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => sendWhatsAppMessage('shipped_update')}
          className="cursor-pointer"
        >
          <Truck className="h-4 w-4 mr-2 text-blue-600" />
          <span>Shipped Update</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => sendWhatsAppMessage('delivered_confirmation')}
          className="cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4 mr-2 text-purple-600" />
          <span>Delivered Confirmation</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => sendWhatsAppMessage('follow_up')}
          className="cursor-pointer"
        >
          <RefreshCw className="h-4 w-4 mr-2 text-orange-600" />
          <span>Follow-up Message</span>
        </DropdownMenuItem>

        {!hasValidPhone && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              ⚠️ Invalid phone number
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
