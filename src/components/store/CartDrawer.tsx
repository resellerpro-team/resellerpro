'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getItemCount } = useCartStore()
  const router = useRouter()
  const params = useParams()
  const shopSlug = params?.shopSlug as string
  const overlayRef = useRef<HTMLDivElement>(null)

  const subtotal = getSubtotal()
  const itemCount = getItemCount()
  const shippingFee = subtotal >= 500 ? 0 : 49
  const total = subtotal + shippingFee

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  function handleCheckout() {
    closeCart()
    router.push(`/store/${shopSlug}/checkout`)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer — bottom sheet on mobile, side panel on desktop */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col lg:left-auto lg:top-0 lg:right-0 lg:bottom-0 lg:w-[420px] lg:rounded-none lg:rounded-l-3xl lg:max-h-full"
          >
            {/* Handle bar (mobile) */}
            <div className="lg:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-slate-700" />
                <h2 className="font-bold text-lg text-slate-900">
                  Your Cart
                </h2>
                {itemCount > 0 && (
                  <span
                    className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--store-primary, #6366f1)' }}
                  >
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <ShoppingBag className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="font-semibold text-slate-600">Your cart is empty</p>
                  <p className="text-sm text-slate-400 mt-1">Add some products to get started</p>
                  <button
                    onClick={closeCart}
                    className="mt-4 text-sm font-bold underline"
                    style={{ color: 'var(--store-primary, #6366f1)' }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.productId} className="flex gap-3 bg-slate-50 rounded-2xl p-3">
                    {/* Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{item.name}</p>
                      {item.variantName && (
                        <p className="text-xs text-slate-500">{item.variantName}</p>
                      )}
                      <p className="font-bold text-sm mt-1" style={{ color: 'var(--store-primary, #6366f1)' }}>
                        ₹{item.price.toLocaleString('en-IN')}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity */}
                        <div className="flex items-center gap-1 bg-white rounded-xl border">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Subtotal + Remove */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t px-5 py-5 space-y-3 bg-white">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Shipping</span>
                  <span className={shippingFee === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-slate-400">
                    Add ₹{(500 - subtotal).toLocaleString('en-IN')} more for free shipping
                  </p>
                )}
                <div className="flex justify-between font-bold text-base pt-1 border-t">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full h-12 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: 'var(--store-primary, #6366f1)' }}
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={closeCart}
                  className="w-full text-center text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  ← Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
