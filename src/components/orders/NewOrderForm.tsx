'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Save, Loader2, Package } from 'lucide-react'

type Customer = {
  id: string
  name: string
  phone: string
}

type Product = {
  id: string
  name: string
  selling_price: number
  cost_price: number
  stock_status: string
}

type OrderItem = {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  unitCost: number
}

export function NewOrderForm({
  customers,
  products,
}: {
  customers: Customer[]
  products: Product[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [paymentStatus, setPaymentStatus] = useState('unpaid')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [discount, setDiscount] = useState(0)
  const [shippingCost, setShippingCost] = useState(0)
  const [notes, setNotes] = useState('')

  // Add product to order
  const handleAddProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    // Check if product already added
    const existingItem = orderItems.find((item) => item.productId === productId)
    if (existingItem) {
      toast({
        title: 'Product already added',
        description: 'Please update the quantity instead',
        variant: 'destructive',
      })
      return
    }

    const newItem: OrderItem = {
      id: Math.random().toString(),
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.selling_price,
      unitCost: product.cost_price,
    }

    setOrderItems([...orderItems, newItem])
  }

  // Update item quantity
  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return
    setOrderItems(
      orderItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  // Update item price
  const handleUpdatePrice = (itemId: string, price: number) => {
    if (price < 0) return
    setOrderItems(
      orderItems.map((item) =>
        item.id === itemId ? { ...item, unitPrice: price } : item
      )
    )
  }

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId))
  }

  // Calculate totals
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  const totalCost = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  )
  const total = subtotal + shippingCost - discount
  const profit = total - totalCost

  // Submit order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCustomerId) {
      toast({
        title: 'Error',
        description: 'Please select a customer',
        variant: 'destructive',
      })
      return
    }

    if (orderItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one product',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: selectedCustomerId,
            items: orderItems,
            paymentStatus,
            paymentMethod,
            discount,
            shippingCost,
            notes,
            subtotal,
            totalAmount: total,
            totalCost,
          }),
        })

        const data = await response.json()

        if (data.success) {
          toast({
            title: 'Success',
            description: `Order ${data.orderNumber} created successfully!`,
          })
          router.push(`/orders/${data.orderId}`)
          router.refresh()
        } else {
          toast({
            title: 'Error',
            description: data.message,
            variant: 'destructive',
          })
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Something went wrong',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Select Customer *</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {customers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No customers found.{' '}
                  <Link href="/customers/new" className="text-primary underline">
                    Add one first
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Add Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Product</Label>
              <Select onValueChange={handleAddProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product to add..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ₹{product.selling_price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Order Items List */}
            {orderItems.length > 0 ? (
              <div className="space-y-3 pt-4">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        Cost: ₹{item.unitCost}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(item.id, parseInt(e.target.value))
                          }
                          className="w-16 h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUpdatePrice(item.id, parseFloat(e.target.value))
                          }
                          className="w-24 h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Total</Label>
                        <p className="text-sm font-semibold h-8 flex items-center">
                          ₹{(item.quantity * item.unitPrice).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">
                  No products added yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Shipping Cost (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="netbanking">Net Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for this order..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-red-500">-₹{discount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>Profit</span>
                <span>₹{profit.toFixed(2)}</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isPending || !selectedCustomerId || orderItems.length === 0}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Order
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {orderItems.length} item(s) added
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}