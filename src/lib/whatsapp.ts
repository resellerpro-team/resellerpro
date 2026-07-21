import type { Order, Profile } from '@/types'

// ─── Message Generators ───────────────────────────────────────────────────────

export function generateOrderConfirmationMessage(
  order: Order,
  profile: Profile
): string {
  const storeName = profile.shop_name || profile.business_name || 'Our Store'

  const items =
    order.order_items
      ?.map(
        (item) =>
          `  • ${item.product_name} × ${item.quantity} = ₹${item.total_price.toLocaleString('en-IN')}`
      )
      .join('\n') ?? '  (items not available)'

  const paymentSection =
    order.payment_method_v2 === 'upi'
      ? [
          `💳 *Payment:* UPI Transfer`,
          `📱 UPI ID: *${profile.upi_id ?? 'Contact seller'}*`,
          `💰 Amount: *₹${(order.total_amount ?? order.total ?? 0).toLocaleString('en-IN')}*`,
          ``,
          `Please transfer and send payment screenshot to confirm order.`,
        ].join('\n')
      : [
          `💵 *Payment:* Cash on Delivery`,
          `Please keep exact change ready at the time of delivery.`,
        ].join('\n')

  const totalAmount = order.total_amount ?? order.total ?? 0
  const subtotal = order.subtotal ?? totalAmount
  const shippingFee = order.shipping_fee ?? 0

  const message = [
    `🎉 *Order Confirmed!*`,
    ``,
    `Hi ${order.customer_name ?? order.shipping_name ?? 'Customer'}! 👋`,
    `Your order from *${storeName}* has been confirmed.`,
    ``,
    `📦 *Order #${order.order_number}*`,
    items,
    ``,
    `─────────────────`,
    `💰 Subtotal: ₹${subtotal.toLocaleString('en-IN')}`,
    `🚚 Shipping: ${shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString('en-IN')}`}`,
    `💳 *Total: ₹${totalAmount.toLocaleString('en-IN')}*`,
    `─────────────────`,
    ``,
    `📍 *Delivery Address:*`,
    order.shipping_name ?? order.customer_name,
    order.shipping_line1,
    order.shipping_line2 ? order.shipping_line2 : null,
    `${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}`,
    ``,
    paymentSection,
    ``,
    `⏱ Expected Delivery: 3–5 working days`,
    ``,
    `Thank you for shopping with us! 🙏`,
    `Reply here for any queries.`,
  ]
    .filter((line): line is string => line !== null)
    .join('\n')

  return message
}

export function generateShippingUpdateMessage(
  order: Order,
  profile: Profile,
  trackingNumber?: string
): string {
  const storeName = profile.shop_name || profile.business_name || 'Our Store'
  return [
    `📦 *Order Shipped!*`,
    ``,
    `Hi ${order.customer_name ?? 'Customer'}!`,
    ``,
    `Your order *#${order.order_number}* from *${storeName}* has been shipped!`,
    trackingNumber ? `🔍 *Tracking Number:* ${trackingNumber}` : '',
    ``,
    `Expected delivery in 3–5 working days 🚚`,
    ``,
    `Thank you for your order! 🙏`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function generatePaymentReminderMessage(
  order: Order,
  profile: Profile
): string {
  const storeName = profile.shop_name || profile.business_name || 'Our Store'
  const totalAmount = order.total_amount ?? order.total ?? 0
  return [
    `⚠️ *Payment Reminder*`,
    ``,
    `Hi ${order.customer_name ?? 'Customer'}!`,
    ``,
    `Friendly reminder for your order from *${storeName}*:`,
    `Order: *#${order.order_number}*`,
    ``,
    `💰 *Amount Due:* ₹${totalAmount.toLocaleString('en-IN')}`,
    `📱 *UPI ID:* ${profile.upi_id ?? 'Contact seller'}`,
    ``,
    `Please complete payment within 2 hours.`,
    `Send payment screenshot after transfer.`,
    ``,
    `Thank you! 🙏`,
  ].join('\n')
}

export function generateDeliveredMessage(
  order: Order,
  profile: Profile
): string {
  const storeName = profile.shop_name || profile.business_name || 'Our Store'
  return [
    `✅ *Order Delivered!*`,
    ``,
    `Hi ${order.customer_name ?? 'Customer'}!`,
    ``,
    `Your order *#${order.order_number}* from *${storeName}* has been delivered! 🎉`,
    ``,
    `Hope you love your purchase! 💛`,
    ``,
    `Please leave us a review — it helps a lot.`,
    ``,
    `Thank you for shopping with us! 🙏`,
  ].join('\n')
}

// ─── Link Generators ──────────────────────────────────────────────────────────

export function generateWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  const clean = phoneNumber.replace(/\D/g, '')
  const phone = clean.startsWith('91') ? clean : `91${clean}`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function generateStoreLaunchMessage(
  storeUrl: string,
  storeName: string
): string {
  return [
    `🎉 My online store is now live!`,
    ``,
    `Shop here 👉 ${storeUrl}`,
    ``,
    `✅ Easy checkout`,
    `✅ COD available`,
    `✅ Fast delivery`,
    ``,
    `Check out — ${storeName} 🛍️`,
  ].join('\n')
}
