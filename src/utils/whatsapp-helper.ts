/**
 * Helper function to generate WhatsApp message for order status updates
 */
export function generateStatusMessage(
    customerName: string,
    orderNumber: string,
    status: string,
    trackingNumber?: string,
    courierName?: string,
    orderDetails?: { products: string[]; totalAmount: number } | null,
    shopName: string = 'Your Store'
): string {
    const productList = orderDetails?.products?.length
        ? `\n\n*YOUR ORDER INCLUDES:*\n${orderDetails.products.map(p => `   • ${p}`).join('\n')}`
        : ''

    const amount = orderDetails?.totalAmount
        ? `\n\n*Order Total:* ₹${orderDetails.totalAmount.toFixed(2)}`
        : ''

    const statusMessages: Record<string, string> = {
        processing: `Hi ${customerName},

Exciting news about your order from *${shopName}*!

━━━━━━━━━━━━━━━━━━━━━
*ORDER IN PROGRESS*
Order ID: #${orderNumber}${productList}${amount}
━━━━━━━━━━━━━━━━━━━━━

*CURRENT STATUS:* 🔄 Processing

Your order is now in our fulfillment center and being carefully prepared for dispatch. Our team is ensuring everything is perfect before shipping.

*WHAT'S NEXT?*
We'll notify you immediately once your order is shipped with complete tracking details.

Thank you for your patience!

Warm regards,
*${shopName}* Team`,

        shipped: `Hi ${customerName},

Your order from *${shopName}* is on its way to you!

━━━━━━━━━━━━━━━━━━━━━
*ORDER SHIPPED*
Order ID: #${orderNumber}${productList}${amount}
━━━━━━━━━━━━━━━━━━━━━

*CURRENT STATUS:* 🚚 In Transit

*SHIPPING DETAILS:*${courierName ? `\n📦 Courier Partner: *${courierName}*` : ''
            }${trackingNumber ? `\n🔍 Tracking ID: *${trackingNumber}*` : ''
            }

Your order has left our facility and is being delivered to your doorstep. Expected delivery: 3-5 business days.
${trackingNumber ? '\n_You can track your shipment in real-time using the tracking ID above._' : ''}

We hope you're as excited as we are!

Warm regards,
*${shopName}* Team`,

        delivered: `Hi ${customerName},

Your order from *${shopName}* has been successfully delivered!

━━━━━━━━━━━━━━━━━━━━━
*DELIVERY COMPLETE*
Order ID: #${orderNumber}${productList}${amount}
━━━━━━━━━━━━━━━━━━━━━

*CURRENT STATUS:* ✅ Delivered

We hope you absolutely love your purchase! Your satisfaction is our top priority.

*WE VALUE YOUR FEEDBACK*
How was your experience? We'd love to hear from you.

_Any concerns? Our support team is here to help - just reply to this message._

Thank you for being an amazing customer!

With gratitude,
*${shopName}* Team`,

        cancelled: `Hi ${customerName},

We're writing to inform you about your order cancellation from *${shopName}*.

━━━━━━━━━━━━━━━━━━━━━
*ORDER CANCELLED*
Order ID: #${orderNumber}${productList}${amount}
━━━━━━━━━━━━━━━━━━━━━

*CURRENT STATUS:* ❌ Cancelled

We apologize for any inconvenience this may have caused. If you have any questions regarding your refund or the reason for cancellation, please don't hesitate to reach out.

Warm regards,
*${shopName}* Team`
    }

    return statusMessages[status] || `Hi ${customerName}, your order #${orderNumber} is now ${status}.`
}
