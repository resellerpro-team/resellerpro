// ✅ Remove 'use server' - this is a utility file, not server actions

const IS_MOCK = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === 'mock'

// ✅ Mock Razorpay client (no real Razorpay needed)
export const razorpay = {
  orders: {
    create: async (options: any) => {
      if (IS_MOCK) {
        console.log('🧪 MOCK: Creating Razorpay order', options)
        return {
          id: `order_mock_${Date.now()}`,
          entity: 'order',
          amount: options.amount,
          currency: options.currency || 'INR',
          receipt: options.receipt,
          status: 'created',
          notes: options.notes || {},
        }
      }
      
      // Real Razorpay (when you have keys)
      const Razorpay = (await import('razorpay')).default
      const client = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      })
      return client.orders.create(options)
    },
  },
}

export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  if (IS_MOCK) {
    console.log('🧪 MOCK: Auto-verifying payment signature')
    return true // Always succeed in mock mode
  }

  // Real verification
  const crypto = require('crypto')
  const text = razorpayOrderId + '|' + razorpayPaymentId
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(text)
    .digest('hex')
  
  return generated_signature === razorpaySignature
}

// ✅ Regular function (not async) - this is fine now
export const isMockMode = () => IS_MOCK