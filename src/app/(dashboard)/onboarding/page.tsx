'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Package, User, Check, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Step 1: Store Settings
  const [shopName, setShopName] = useState('')
  const [shopSlug, setShopSlug] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [upiId, setUpiId] = useState('')
  const [shopDescription, setShopDescription] = useState('')
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  
  // Step 2: First Product
  const [productName, setProductName] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('10')
  const [productDescription, setProductDescription] = useState('')
  const [createdProductId, setCreatedProductId] = useState<string | null>(null)
  
  // Step 3: First Customer & Test Order
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [shippingLine1, setShippingLine1] = useState('')
  const [shippingCity, setShippingCity] = useState('')
  const [shippingState, setShippingState] = useState('')
  const [shippingPincode, setShippingPincode] = useState('')
  const [orderQuantity, setOrderQuantity] = useState('1')
  
  // Check auth on load
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in first.')
        router.push('/signin')
        return
      }
      setUser(user)
      
      // Fetch current profile to pre-fill if exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        
      if (profile) {
        if (profile.onboarding_completed) {
          router.push('/dashboard')
          return
        }
        setShopName(profile.shop_name || profile.business_name || '')
        setShopSlug(profile.shop_slug || '')
        setWhatsappNumber(profile.whatsapp_number || profile.phone || '')
        setUpiId(profile.upi_id || '')
        setShopDescription(profile.shop_description || '')
        if (profile.shop_slug) {
          setSlugStatus('available')
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [router, supabase])

  // Auto-generate slug from shop name
  useEffect(() => {
    if (currentStep === 1 && shopName && !shopSlug) {
      const generated = shopName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setShopSlug(generated)
    }
  }, [shopName, currentStep])

  // Check slug uniqueness
  useEffect(() => {
    if (!shopSlug || !user) {
      setSlugStatus('idle')
      return
    }
    
    const timeout = setTimeout(async () => {
      setSlugStatus('checking')
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('shop_slug', shopSlug)
        .maybeSingle()
        
      if (error) {
        setSlugStatus('idle')
        return
      }
      
      if (data && data.id !== user.id) {
        setSlugStatus('taken')
      } else {
        setSlugStatus('available')
      }
    }, 500)
    
    return () => clearTimeout(timeout)
  }, [shopSlug, user, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-slate-500 font-medium">Loading Setup Wizard...</p>
      </div>
    )
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopName || !shopSlug || !whatsappNumber) {
      toast.error('Please fill in all required fields.')
      return
    }
    if (slugStatus === 'taken') {
      toast.error('This shop link is already taken.')
      return
    }
    
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          shop_name: shopName,
          shop_slug: shopSlug,
          whatsapp_number: whatsappNumber,
          upi_id: upiId || null,
          shop_description: shopDescription || null,
          onboarding_step: 2
        })
        .eq('id', user.id)
        
      if (error) throw error
      
      toast.success('Shop profile saved successfully!')
      setCurrentStep(2)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save store profile.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productName || !sellingPrice) {
      toast.error('Please fill in all required fields.')
      return
    }
    
    setIsSubmitting(true)
    try {
      // Insert product
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: productName,
          selling_price: parseFloat(sellingPrice),
          cost_price: costPrice ? parseFloat(costPrice) : null,
          stock_quantity: parseInt(stockQuantity) || 0,
          stock_status: (parseInt(stockQuantity) || 0) > 0 ? 'in_stock' : 'out_of_stock',
          description: productDescription || null
        })
        .select()
        .single()
        
      if (error) throw error
      
      setCreatedProductId(product.id)
      
      // Update onboarding step
      await supabase
        .from('profiles')
        .update({ onboarding_step: 3 })
        .eq('id', user.id)

      toast.success('First product added!')
      setCurrentStep(3)
    } catch (err: any) {
      toast.error(err.message || 'Failed to add product.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !customerPhone) {
      toast.error('Please fill in customer details.')
      return
    }
    
    setIsSubmitting(true)
    try {
      // 1. Create Customer
      const { data: customer, error: custError } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          name: customerName,
          phone: customerPhone,
          address_line1: shippingLine1 || null,
          city: shippingCity || null,
          state: shippingState || null,
          pincode: shippingPincode || null
        })
        .select()
        .single()
        
      if (custError) throw custError
      
      // 2. Create Order
      const totalAmount = parseFloat(sellingPrice) * parseInt(orderQuantity)
      const costAmount = costPrice ? parseFloat(costPrice) * parseInt(orderQuantity) : 0
      const totalProfit = totalAmount - costAmount
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_id: customer.id,
          total_amount: totalAmount,
          total_profit: totalProfit,
          status: 'pending',
          payment_method_v2: 'cod',
          payment_status_v2: 'pending',
          customer_name: customerName,
          customer_phone: customerPhone,
          shipping_name: customerName,
          shipping_phone: customerPhone,
          shipping_line1: shippingLine1 || null,
          shipping_city: shippingCity || null,
          shipping_state: shippingState || null,
          shipping_pincode: shippingPincode || null,
          source: 'manual'
        })
        .select()
        .single()
        
      if (orderError) throw orderError
      
      // 3. Create Order Item
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: createdProductId,
          product_name: productName,
          quantity: parseInt(orderQuantity),
          unit_price: parseFloat(sellingPrice),
          // support legacy columns just in case database constraints exist
          unit_selling_price: parseFloat(sellingPrice),
          unit_cost_price: costPrice ? parseFloat(costPrice) : 0,
          subtotal: totalAmount,
          profit: totalProfit
        })
        
      if (itemError) throw itemError
      
      // 4. Mark Onboarding Complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_step: 4
        })
        .eq('id', user.id)
        
      if (profileError) throw profileError
      
      toast.success('Onboarding complete! Welcome to ResellerPro.')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Failed to finalize setup.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { step: 1, title: 'Store Settings', desc: 'Create your custom store URL & details', icon: Sparkles },
    { step: 2, title: 'First Product', desc: 'Add an item to showcase in your store', icon: Package },
    { step: 3, title: 'Log First Sale', desc: 'Add a customer & record a demo order', icon: User }
  ]

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Set Up Your Storefront 🚀
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Complete these 3 steps to go live and receive orders.
          </p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Step {currentStep} of 3</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2 rounded-full" />
        </div>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
            >
              {currentStep === 1 && (
                <form onSubmit={handleStep1Submit}>
                  <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <CardTitle className="text-xl flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      1. Create Your Shop Link
                    </CardTitle>
                    <CardDescription>
                      Configure your public URL and WhatsApp number where buyers will message you.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="shopName">Shop Name <span className="text-rose-500">*</span></Label>
                      <Input
                        id="shopName"
                        placeholder="e.g. Rashid Garments"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="shopSlug">Custom Shop Link <span className="text-rose-500">*</span></Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-mono select-none">
                          resellerpro.in/store/
                        </span>
                        <Input
                          id="shopSlug"
                          placeholder="shop-slug"
                          value={shopSlug}
                          onChange={(e) => setShopSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          required
                          className="pl-[145px] font-mono rounded-xl"
                        />
                      </div>
                      <div className="text-xs">
                        {slugStatus === 'checking' && <span className="text-slate-500">Checking availability...</span>}
                        {slugStatus === 'available' && <span className="text-emerald-500 font-medium">✓ Custom link is available!</span>}
                        {slugStatus === 'taken' && <span className="text-rose-500 font-medium">✗ Link is already taken. Try another name.</span>}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="whatsapp">WhatsApp Number <span className="text-rose-500">*</span></Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="e.g. 9876543210 (10 digit)"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        required
                        className="rounded-xl"
                      />
                      <p className="text-[11px] text-slate-500">
                        Customers will send order confirmations and UPI proofs directly to this number.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="upi">UPI ID (Optional)</Label>
                      <Input
                        id="upi"
                        placeholder="e.g. shopname@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="rounded-xl"
                      />
                      <p className="text-[11px] text-slate-500">
                        Required if you want customers to pay you using phone/UPI apps directly.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="desc">Shop Description (Optional)</Label>
                      <Textarea
                        id="desc"
                        placeholder="e.g. Quality fabrics at Wholesale prices."
                        value={shopDescription}
                        onChange={(e) => setShopDescription(e.target.value)}
                        className="rounded-xl min-h-[70px]"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-slate-100 dark:border-slate-800 p-6 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting || slugStatus === 'taken' || !shopName || !shopSlug || !whatsappNumber}
                      className="w-full sm:w-auto px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        'Save & Continue'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              )}

              {currentStep === 2 && (
                <form onSubmit={handleStep2Submit}>
                  <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <CardTitle className="text-xl flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <Package className="w-5 h-5 text-indigo-500" />
                      2. Add Your First Product
                    </CardTitle>
                    <CardDescription>
                      Describe your item and set its price. This product will appear on your storefront page.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="prodName">Product Name <span className="text-rose-500">*</span></Label>
                      <Input
                        id="prodName"
                        placeholder="e.g. Designer Rayon Kurti"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="sellPrice">Selling Price (₹) <span className="text-rose-500">*</span></Label>
                        <Input
                          id="sellPrice"
                          type="number"
                          placeholder="e.g. 599"
                          value={sellingPrice}
                          onChange={(e) => setSellingPrice(e.target.value)}
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="costPrice">Cost Price (₹)</Label>
                        <Input
                          id="costPrice"
                          type="number"
                          placeholder="e.g. 350"
                          value={costPrice}
                          onChange={(e) => setCostPrice(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="stock">Initial Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        placeholder="e.g. 10"
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="prodDesc">Product Description (Optional)</Label>
                      <Textarea
                        id="prodDesc"
                        placeholder="Describe size options, fabric type, colors, etc."
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-slate-100 dark:border-slate-800 p-6 flex justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCurrentStep(1)}
                      className="rounded-xl"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !productName || !sellingPrice}
                      className="px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                        </>
                      ) : (
                        'Add & Continue'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              )}

              {currentStep === 3 && (
                <form onSubmit={handleStep3Submit}>
                  <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <CardTitle className="text-xl flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <User className="w-5 h-5 text-indigo-500" />
                      3. Log Your First Sale
                    </CardTitle>
                    <CardDescription>
                      Record a demo order to see how orders appear and how your WhatsApp confirmation works.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800/80">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Preview</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{productName || 'First Product'}</span>
                        <span className="text-indigo-600 font-bold">₹{sellingPrice || '0'} × {orderQuantity}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="custName">Buyer Name <span className="text-rose-500">*</span></Label>
                      <Input
                        id="custName"
                        placeholder="e.g. Ramesh Kumar"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="custPhone">Buyer WhatsApp Number <span className="text-rose-500">*</span></Label>
                      <Input
                        id="custPhone"
                        type="tel"
                        placeholder="e.g. 9876543210 (10 digit)"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="custQty">Quantity to Order</Label>
                      <Input
                        id="custQty"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-4 pt-3 space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Shipping Details (Optional)</Label>
                      <div className="space-y-3">
                        <Input
                          placeholder="Address Line (e.g. 123 Main St)"
                          value={shippingLine1}
                          onChange={(e) => setShippingLine1(e.target.value)}
                          className="rounded-xl"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            placeholder="City"
                            value={shippingCity}
                            onChange={(e) => setShippingCity(e.target.value)}
                            className="rounded-xl text-xs"
                          />
                          <Input
                            placeholder="State"
                            value={shippingState}
                            onChange={(e) => setShippingState(e.target.value)}
                            className="rounded-xl text-xs"
                          />
                          <Input
                            placeholder="Pincode"
                            value={shippingPincode}
                            onChange={(e) => setShippingPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-slate-100 dark:border-slate-800 p-6 flex justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCurrentStep(2)}
                      className="rounded-xl"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !customerName || !customerPhone}
                      className="px-6 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizing...
                        </>
                      ) : (
                        'Complete Setup'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  )
}