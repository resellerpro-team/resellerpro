'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import { 
  ChevronLeft, Truck, Smartphone, ShoppingBag, User, 
  ChevronRight, ShieldCheck, Lock, Package, Gift
} from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import { placeOrder } from './actions'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu and Kashmir','Ladakh','Puducherry',
]

const schema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  addressLine1: z.string().min(5, 'Enter full address'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter valid 6-digit pincode'),
  paymentMethod: z.enum(['cod', 'upi']),
  orderNotes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface CheckoutPageProps {
  storeUserId: string
  shopSlug: string
  upiId?: string | null
  shopName?: string | null
}

function CheckoutPageInner({ storeUserId, shopSlug, upiId, shopName }: CheckoutPageProps) {
  const router = useRouter()
  const { items, getSubtotal, clearCart } = useCartStore()
  const [payment, setPayment] = useState<'cod' | 'upi'>('cod')
  const [loading, setLoading] = useState(false)

  const subtotal = getSubtotal()
  const shippingFee = subtotal >= 500 ? 0 : 49
  const total = subtotal + shippingFee

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'cod' },
  })

  useEffect(() => {
    if (items.length === 0) router.replace(`/store/${shopSlug}`)
    trackEvent({ userId: storeUserId, eventType: 'checkout_start', metadata: { itemCount: items.length, total } })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const result = await placeOrder({
        storeUserId,
        customer: {
          fullName: data.fullName,
          phone: data.phone,
          email: data.email || null,
        },
        shipping: {
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
        },
        paymentMethod: data.paymentMethod,
        orderNotes: data.orderNotes || null,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal,
        shippingFee,
        total,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      await trackEvent({
        userId: storeUserId,
        eventType: 'checkout_complete',
        orderId: result.orderId,
        metadata: { paymentMethod: data.paymentMethod, total },
      })

      clearCart()
      router.push(`/store/${shopSlug}/success/${result.orderId}`)
    } catch (err: any) {
      console.error('Checkout error:', err)
      alert(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-black text-slate-900 text-sm uppercase tracking-wider">Secure Checkout</h1>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">SSL Secured</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left: Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="checkout-form">

              {/* Step 1: Contact */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center text-[10px] font-black">1</div>
                  <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider">Contact Details</h2>
                </div>
                <div>
                  <label htmlFor="fullName" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name *</label>
                  <input id="fullName" {...register('fullName')} placeholder="Your full name"
                    className="mt-1.5 w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 bg-white text-slate-900 transition-all" />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="text-xs font-bold text-slate-600 uppercase tracking-wider">WhatsApp Number *</label>
                  <div className="flex mt-1.5 rounded-xl border border-slate-200 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-300 transition-all">
                    <span className="px-3.5 flex items-center text-xs text-slate-400 bg-slate-50 border-r border-slate-200 font-bold">+91</span>
                    <input id="phone" {...register('phone')} placeholder="9876543210" maxLength={10}
                      className="flex-1 h-11 px-3.5 text-sm focus:outline-none bg-white text-slate-900" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">Order updates will be sent here via WhatsApp</p>
                  {errors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone.message}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email (Optional)</label>
                  <input id="email" type="email" {...register('email')} placeholder="your@email.com"
                    className="mt-1.5 w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 bg-white text-slate-900 transition-all" />
                </div>
              </div>

              {/* Step 2: Address */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center text-[10px] font-black">2</div>
                  <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider">Delivery Address</h2>
                </div>
                <div>
                  <label htmlFor="addressLine1" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Address Line 1 *</label>
                  <input id="addressLine1" {...register('addressLine1')} placeholder="House no, Street, Area"
                    className="mt-1.5 w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 bg-white text-slate-900 transition-all" />
                  {errors.addressLine1 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.addressLine1.message}</p>}
                </div>
                <div>
                  <label htmlFor="addressLine2" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Address Line 2 (Optional)</label>
                  <input id="addressLine2" {...register('addressLine2')} placeholder="Landmark, Apartment no"
                    className="mt-1.5 w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 bg-white text-slate-900 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="city" className="text-xs font-bold text-slate-600 uppercase tracking-wider">City *</label>
                    <input id="city" {...register('city')} placeholder="City"
                      className="mt-1.5 w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 bg-white text-slate-900 transition-all" />
                    {errors.city && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="pincode" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Pincode *</label>
                    <input id="pincode" {...register('pincode')} placeholder="123456" maxLength={6}
                      className="mt-1.5 w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 bg-white text-slate-900 transition-all" />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.pincode.message}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="state" className="text-xs font-bold text-slate-600 uppercase tracking-wider">State *</label>
                  <select id="state" {...register('state')}
                    className="mt-1.5 w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 bg-white text-slate-900 transition-all">
                    <option value="" className="text-slate-900 bg-white">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s} className="text-slate-900 bg-white">
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.state.message}</p>}
                </div>
              </div>

              {/* Step 3: Payment */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center text-[10px] font-black">3</div>
                  <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider">Payment Method</h2>
                </div>

                {(['cod', 'upi'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => { setPayment(method); setValue('paymentMethod', method) }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      payment === method 
                        ? 'border-slate-900 bg-slate-50/50' 
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      payment === method ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {method === 'cod' ? <Truck className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-extrabold text-sm text-slate-900">{method === 'cod' ? 'Cash on Delivery' : 'Pay via UPI'}</p>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                        {method === 'cod' ? 'Pay when your order arrives at your doorstep' : 'Seller will send UPI details on WhatsApp'}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      payment === method ? 'border-slate-900' : 'border-slate-300'
                    }`}>
                      {payment === method && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                    </div>
                  </button>
                ))}

                {payment === 'upi' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-700 font-semibold flex items-start gap-2">
                    <Smartphone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>After placing order, seller will send you UPI payment link/QR on WhatsApp. Complete payment within 2 hours to confirm.</span>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
                <label htmlFor="orderNotes" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Order Notes (Optional)</label>
                <textarea id="orderNotes" {...register('orderNotes')} rows={2} placeholder="Any special instructions for your order..."
                  className="mt-2 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 bg-white resize-none transition-all" />
              </div>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20 space-y-5">
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <ShoppingBag className="w-4 h-4 text-slate-500" />
                  <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider">Order Summary</h2>
                </div>

                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3 items-center">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-slate-900 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-400 font-semibold">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-black text-slate-900 flex-shrink-0">
                        {'\u20B9'}{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2.5">
                  <div className="flex justify-between text-xs text-slate-500 font-semibold">
                    <span>Subtotal</span>
                    <span>{'\u20B9'}{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-semibold">
                    <span>Shipping</span>
                    <span className={shippingFee === 0 ? 'text-green-600 font-black' : ''}>
                      {shippingFee === 0 ? 'FREE' : `\u20B9${shippingFee}`}
                    </span>
                  </div>
                  {shippingFee > 0 && (
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Add {'\u20B9'}{(500 - subtotal).toLocaleString('en-IN')} more for free shipping
                    </p>
                  )}
                  <div className="flex justify-between font-black text-base pt-2.5 border-t border-slate-100">
                    <span className="text-slate-900">Total</span>
                    <span className="text-slate-900">{'\u20B9'}{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full h-14 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2.5 bg-slate-950 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-slate-900/10"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Placing Order...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">Place Order <ChevronRight className="w-4 h-4" /></span>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-bold">
                <div className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  <span>Fast Delivery</span>
                </div>
              </div>

              <p className="text-center text-[10px] text-slate-400 pb-4 font-semibold">
                By placing this order you agree to our terms. Seller will confirm via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Wrapper
export default function CheckoutPage() {
  const params = useParams()
  const shopSlug = params?.shopSlug as string
  const supabase = createClient()
  const [storeData, setStoreData] = useState<{ id: string; upi_id: string | null; shop_name: string | null } | null>(null)

  useEffect(() => {
    if (!shopSlug) return
    supabase
      .from('profiles')
      .select('id, upi_id, shop_name, business_name')
      .eq('shop_slug', shopSlug)
      .single()
      .then(({ data }) => {
        if (data) setStoreData({ id: data.id, upi_id: data.upi_id, shop_name: data.shop_name || data.business_name })
      })
  }, [shopSlug]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!storeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <CheckoutPageInner
      storeUserId={storeData.id}
      shopSlug={shopSlug}
      upiId={storeData.upi_id}
      shopName={storeData.shop_name}
    />
  )
}
