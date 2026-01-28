'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Save, Loader2, Package, AlertTriangle } from 'lucide-react'
import { createOrder } from '@/app/(dashboard)/orders/actions'
import { usePlanLimits } from '@/hooks/usePlanLimits'

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
  stock_quantity: number
}

type OrderItem = {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  unitCost: number
  stockStatus: string
  maxStock: number
}

export function NewOrderForm({
  customers,
  products,
  preSelectedCustomerId,
}: {
  customers: Customer[]
  products: Product[]
  preSelectedCustomerId?: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { subscription } = usePlanLimits()
  const planName = subscription?.plan?.display_name || 'Free Plan'

  const [isPending, startTransition] = useTransition()

  const [selectedCustomerId, setSelectedCustomerId] = useState(preSelectedCustomerId || '')
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [paymentStatus, setPaymentStatus] = useState('unpaid')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [discount, setDiscount] = useState('0')
  const [shippingCost, setShippingCost] = useState('0')
  const [notes, setNotes] = useState('')

  // Set pre-selected customer when it changes
  useEffect(() => {
    if (preSelectedCustomerId) {
      setSelectedCustomerId(preSelectedCustomerId)
      const customer = customers.find((c) => c.id === preSelectedCustomerId)
      if (customer) {
        toast({
          title: 'Customer Selected',
          description: `Creating order for ${customer.name}`,
        })
      }
    }
  }, [preSelectedCustomerId, customers, toast])

  const handleNumberInput = (value: string, setter: (val: string) => void) => {
    if (value === '') {
      setter('')
      return
    }
    if (/^\d*\.?\d*$/.test(value)) {
      setter(value)
    }
  }

  const discountValue = parseFloat(discount) || 0;
  const shippingValue = parseFloat(shippingCost) || 0;

  const getStockBadge = (status: string, quantity?: number) => {
    if (quantity !== undefined && quantity === 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          Out of Stock
        </Badge>
      )
    }

    switch (status) {
      case 'in_stock':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
            In Stock
          </Badge>
        )
      case 'low_stock':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
          >
            Low Stock
          </Badge>
        )
      case 'out_of_stock':
        return (
          <Badge variant="destructive" className="text-xs">
            Out of Stock
          </Badge>
        )
      default:
        return null
    }
  }

  const hasStockIssues = orderItems.some((item) => item.quantity > item.maxStock)

  const handleAddProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    if (product.stock_quantity === 0) {
      toast({
        title: 'Out of Stock',
        description: `${product.name} is currently out of stock`,
        variant: 'destructive',
      })
      return
    }

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
      stockStatus: product.stock_status,
      maxStock: product.stock_quantity,
    }

    setOrderItems([...orderItems, newItem])
  }

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return

    const item = orderItems.find((i) => i.id === itemId)
    if (!item) return

    if (quantity > item.maxStock) {
      toast({
        title: 'Insufficient Stock',
        description: `Only ${item.maxStock} units available for ${item.productName}`,
        variant: 'destructive',
      })

      setOrderItems(
        orderItems.map((i) => (i.id === itemId ? { ...i, quantity: item.maxStock } : i))
      )
      return
    }

    setOrderItems(orderItems.map((i) => (i.id === itemId ? { ...i, quantity } : i)))
  }

  const handleUpdatePrice = (itemId: string, price: number) => {
    if (price < 0) return
    setOrderItems(
      orderItems.map((item) => (item.id === itemId ? { ...item, unitPrice: price } : item))
    )
  }

  const handleRemoveItem = (itemId: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId))
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const totalCost = orderItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0)
  const total = subtotal + shippingValue - discountValue
  const profit = total - totalCost

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

    if (hasStockIssues) {
      toast({
        title: 'Stock Issues',
        description: 'Some items exceed available stock. Please adjust quantities.',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('customerId', selectedCustomerId)
      formData.append('items', JSON.stringify(orderItems))
      formData.append('paymentStatus', paymentStatus)
      formData.append('paymentMethod', paymentMethod)
      formData.append('discount', discount.toString())
      formData.append('shippingCost', shippingCost.toString())
      formData.append('notes', notes)
      formData.append('subtotal', subtotal.toString())
      formData.append('totalAmount', total.toString())
      formData.append('totalCost', totalCost.toString())

      const result = await createOrder({ success: false, message: '' }, formData)

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        })

        queryClient.invalidateQueries({ queryKey: ['orders'] })

        router.push(`/orders/${result.orderId}`)
        router.refresh()
      } else {
        // Handle Limit or Database errors
        const isLimitError = result.message.toLowerCase().includes('limit') ||
          result.message.toLowerCase().includes('database error') &&
          (result.message.toLowerCase().includes('reached') || result.message.toLowerCase().includes('exceeded'));

        if (isLimitError) {
          toast({
            title: "Limit Reached 🔒",
            description: `You've reached your order limit on the ${planName}. Upgrade to grow your business!`,
            variant: "default",
            action: (
              <Link
                href="/settings/subscription"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3"
              >
                Upgrade
              </Link>
            ),
          })
        } else {
          toast({
            title: 'Error',
            description: result.message,
            variant: 'destructive',
          })
        }
      }
    })
  }

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Select Customer *</Label>
              <SearchableSelect
                options={customers.map((c): SearchableSelectOption => ({
                  value: c.id,
                  label: c.name,
                  subtitle: c.phone,
                }))}
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
                placeholder="Choose a customer..."
                searchPlaceholder="Search customers..."
                emptyMessage="No customers found."
              />
              {customers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No customers found.{' '}
                  <Link href="/customers/new" className="text-primary underline">
                    Add one first
                  </Link>
                </p>
              )}
              {preSelectedCustomerId && selectedCustomer && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">
                    ✓ Creating order for: <strong>{selectedCustomer.name}</strong>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add Products</CardTitle>
              <span className="text-sm text-muted-foreground">
                {products.length} product(s) available
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Product</Label>
              {products.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground border rounded-md">
                  No products available.{' '}
                  <Link href="/products/new" className="text-primary underline">
                    Add a product
                  </Link>
                </div>
              ) : (
                <SearchableSelect
                  options={products.map((p): SearchableSelectOption => ({
                    value: p.id,
                    label: `${p.name} - ₹${p.selling_price}`,
                    subtitle: p.stock_quantity <= 10
                      ? `⚠️ Low Stock: ${p.stock_quantity} units`
                      : `Stock: ${p.stock_quantity} units`,
                  }))}
                  value=""
                  onValueChange={handleAddProduct}
                  placeholder="Choose a product to add..."
                  searchPlaceholder="Search products..."
                  emptyMessage="No products found."
                />
              )}
            </div>

            {orderItems.length > 0 ? (
              <div className="space-y-3 pt-4">
                {orderItems.map((item) => {
                  const hasError = item.quantity > item.maxStock
                  const isLowStock = item.stockStatus === 'low_stock' || item.maxStock < 5

                  return (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-lg ${hasError ? 'border-red-500 bg-red-50 dark:bg-red-950/10' : ''
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{item.productName}</p>
                            {getStockBadge(item.stockStatus, item.maxStock)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Cost: ₹{item.unitCost}</span>
                            <span
                              className={`font-medium ${item.maxStock < 5 ? 'text-yellow-600' : ''
                                }`}
                            >
                              Available: {item.maxStock} units
                            </span>
                          </div>
                          {isLowStock && !hasError && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Low stock alert</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">
                              Qty{' '}
                              <span className="text-muted-foreground">(Max: {item.maxStock})</span>
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              max={item.maxStock}
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)
                              }
                              className={`w-20 h-9 ${hasError ? 'border-red-500' : ''}`}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleUpdatePrice(item.id, parseFloat(e.target.value) || 0)
                              }
                              className="w-24 h-9"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Total</Label>
                            <p className="text-sm font-semibold h-9 flex items-center">
                              ₹{(item.quantity * item.unitPrice).toFixed(2)}
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-9 w-9 mt-5"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {hasError && (
                        <Alert variant="destructive" className="mt-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Only {item.maxStock} units available. Quantity has been adjusted to
                            maximum.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">No products added yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount (₹)</Label>
                <Input
                  type="text"
                  value={discount}
                  onChange={(e) => handleNumberInput(e.target.value, setDiscount)}
                />
              </div>

              <div className="space-y-2">
                <Label>Shipping Cost (₹)</Label>
                <Input
                  type="text"
                  value={shippingCost}
                  onChange={(e) => handleNumberInput(e.target.value, setShippingCost)}
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
                <span>₹{shippingValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-red-500">-₹{discountValue.toFixed(2)}</span>
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

            {hasStockIssues && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Please fix stock quantity issues before creating order
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={
                isPending || !selectedCustomerId || orderItems.length === 0 || hasStockIssues
              }
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
