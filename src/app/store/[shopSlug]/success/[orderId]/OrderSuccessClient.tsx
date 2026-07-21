'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, MessageCircle, ShoppingBag, Truck, Smartphone, Package, Copy } from 'lucide-react'
import { generateWhatsAppLink } from '@/lib/whatsapp'
import type { Order, Profile, ShopTheme } from '@/types'

interface OrderSuccessClientProps {
  order: Order
  profile: Profile
  theme: ShopTheme | null
  shopSlug: string
}

export function OrderSuccessClient({ order, profile, theme, shopSlug }: OrderSuccessClientProps) {
  const storeName = profile.shop_name || profile.business_name || 'Store'
  const waNum = profile.whatsapp_number || profile.business_phone
  const waClean = waNum?.replace(/\D/g, '')

  const orderNumber = order.order_number || order.id.slice(0, 8).toUpperCase()
  const totalAmount = order.total_amount || 0

  const waMessage = [
    `Hi! I just placed an order on ${storeName}.`,
    `Order #${orderNumber}`,
    order.payment_method_v2 === 'upi' ? `Payment: UPI` : `Payment: COD`,
    `Total: ₹${totalAmount.toLocaleString('en-IN')}`,
    ``,
    `Please confirm my order. Thank you.`,
  ].join('\n')

  const waLink = waClean
    ? generateWhatsAppLink(waClean, waMessage)
    : null

  const isUPI = order.payment_method_v2 === 'upi'
  const items = order.order_items ?? []

  useEffect(() => {
    // Auto-open WhatsApp after 2s for UPI orders (seller needs to send UPI ID)
    if (isUPI && waLink) {
      const timer = setTimeout(() => {
        window.open(waLink, '_blank')
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [isUPI, waLink])

  function copyOrderId() {
    navigator.clipboard.writeText(String(orderNumber))
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="flex flex-col items-center text-center mb-8"
        >
          <div className="relative mb-5">
            <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center border-2 border-green-100">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-green-300"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }}
            />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-black text-slate-900 mb-1"
          >
            Order Placed
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 text-sm font-semibold"
          >
            Thank you for ordering from <span className="font-black text-slate-700">{storeName}</span>
          </motion.p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4"
        >
          {/* Order Number + Total */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order Number</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-lg font-black text-slate-900">#{orderNumber}</p>
                <button onClick={copyOrderId} className="p-1 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors" title="Copy order ID">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Amount</p>
              <p className="text-lg font-black text-slate-900 mt-1">
                ₹{totalAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Items */}
          {items.length > 0 && (
            <div className="space-y-2.5 mb-5">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Package className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                    <span className="text-slate-600 truncate font-semibold">{item.product_name} × {item.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900 flex-shrink-0 ml-2">₹{item.total_price.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}

          {/* Delivery info */}
          <div className="border-t border-slate-100 pt-4 flex items-center gap-2.5 text-sm text-slate-500">
            <Truck className="w-4 h-4 text-slate-400" />
            <span className="font-semibold">Expected delivery: <strong className="text-slate-700">3–5 working days</strong></span>
          </div>
        </motion.div>

        {/* Payment Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`rounded-2xl p-5 mb-5 border ${
            isUPI
              ? 'bg-blue-50 border-blue-100'
              : 'bg-green-50 border-green-100'
          }`}
        >
          <div className="flex items-start gap-3">
            {isUPI
              ? <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              : <Truck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            }
            <div>
              <p className={`font-black text-sm ${isUPI ? 'text-blue-800' : 'text-green-800'}`}>
                {isUPI ? 'Complete UPI Payment' : 'Cash on Delivery'}
              </p>
              <p className={`text-xs mt-1.5 leading-relaxed font-semibold ${isUPI ? 'text-blue-600' : 'text-green-600'}`}>
                {isUPI
                  ? `The seller will send you their UPI ID on WhatsApp shortly. Please complete the payment to confirm your order.`
                  : `Your order is confirmed! Pay ₹${totalAmount.toLocaleString('en-IN')} in cash when your package arrives.`
                }
              </p>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5"
        >
          <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider mb-3">What happens next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500 flex-shrink-0">1</div>
              <p className="text-xs text-slate-500 font-semibold">Seller will confirm your order on WhatsApp</p>
            </div>
            {isUPI && (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500 flex-shrink-0">2</div>
                <p className="text-xs text-slate-500 font-semibold">Complete UPI payment and send screenshot</p>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500 flex-shrink-0">{isUPI ? '3' : '2'}</div>
              <p className="text-xs text-slate-500 font-semibold">Your order will be packed and shipped within 24-48 hours</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500 flex-shrink-0">{isUPI ? '4' : '3'}</div>
              <p className="text-xs text-slate-500 font-semibold">You'll receive tracking info via WhatsApp</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="w-full h-13 flex items-center justify-center gap-2.5 rounded-2xl text-white font-black text-sm py-3.5 transition-all hover:opacity-90 active:scale-[0.98] bg-green-500 shadow-md shadow-green-200"
            >
              <MessageCircle className="w-5 h-5" />
              Message Seller on WhatsApp
            </a>
          )}

          <Link
            href={`/store/${shopSlug}`}
            className="w-full h-13 flex items-center justify-center gap-2.5 rounded-2xl font-black text-sm py-3.5 transition-all border-2 border-slate-900 text-slate-900 hover:bg-slate-50 active:scale-[0.98]"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>
        </motion.div>

        <p className="text-center text-[10px] text-slate-400 mt-8 font-semibold">
          Powered by <span className="font-black text-slate-500">ResellerPro</span>
        </p>
      </div>
    </div>
  )
}
