export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Printer,
  Package,
  User,
  Truck,
  CheckCircle2,
  CreditCard,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import Link from 'next/link'
import { OrderStatusUpdate } from '@/components/orders/OrderStatusUpdate'
import { PaymentStatusUpdate } from '@/components/orders/PaymentStatusUpdate'
import { CollapsibleSection } from '@/components/orders/CollapsibleSection'

// ✅ FIXED: params is now a Promise
export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // ✅ AWAIT params before using it
  const { id } = await params

  const supabase = await createClient()

  // ✅ Now use the awaited id
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers (*),
      order_items (
        *,
        products (name, image_url)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !order) {
    console.error('Order fetch error:', error)
    return notFound()
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-yellow-500' },
    processing: { label: 'Processing', color: 'bg-blue-500' },
    shipped: { label: 'Shipped', color: 'bg-purple-500' },
    delivered: { label: 'Delivered', color: 'bg-green-500' },
    cancelled: { label: 'Cancelled', color: 'bg-red-500' },
  }

  const paymentConfig: Record<string, { label: string; color: string }> = {
    paid: { label: 'Paid', color: 'text-green-600' },
    unpaid: { label: 'Unpaid', color: 'text-yellow-600' },
    cod: { label: 'COD', color: 'text-orange-600' },
    refunded: { label: 'Refunded', color: 'text-red-600' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Order #{order.order_number}
            </h1>
            <p className="text-sm text-muted-foreground">
              Placed on{' '}
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                dateStyle: 'long',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/orders/${order.id}/invoice`}>
              <Printer className="mr-2 h-4 w-4" />
              Print Invoice
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.order_items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 py-4">
                    <div className="relative h-16 w-16 bg-muted rounded-md flex-shrink-0">
                      <Package className="h-8 w-8 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ₹{parseFloat(item.subtotal).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @ ₹{parseFloat(item.unit_selling_price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            {/* Pricing Details */}
            <CardHeader className="border-t">
              <CardTitle>Pricing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{parseFloat(order.shipping_cost || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-red-500">
                  -₹{parseFloat(order.discount || 0).toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-green-600">
                <span>Profit</span>
                <span>₹{parseFloat(order.profit || 0).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-4">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative z-10 h-5 w-5 rounded-full flex items-center justify-center bg-primary">
                    <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <div className="flex-1 -mt-1">
                    <p className="font-semibold">Order Placed</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {order.status !== 'pending' && (
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative z-10 h-5 w-5 rounded-full flex items-center justify-center bg-primary">
                      <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <div className="flex-1 -mt-1">
                      <p className="font-semibold">
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.updated_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                )}

                {order.delivered_at && (
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative z-10 h-5 w-5 rounded-full flex items-center justify-center bg-primary">
                      <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <div className="flex-1 -mt-1">
                      <p className="font-semibold">Delivered</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.delivered_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Fixed Height and Scroll */}
        <div className="lg:col-span-1">
          <div className="space-y-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Customer Info */}
            {order.customers && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="font-semibold">{order.customers.name}</div>

                  {order.customers.address_line1 && (
                    <>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{order.customers.address_line1}</p>
                        {order.customers.address_line2 && (
                          <p>{order.customers.address_line2}</p>
                        )}
                        <p>
                          {order.customers.city}, {order.customers.state} -{' '}
                          {order.customers.pincode}
                        </p>
                      </div>
                      <Separator />
                    </>
                  )}

                  <div className="text-sm space-y-2">
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {order.customers.phone}
                    </p>
                    {order.customers.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {order.customers.email}
                      </p>
                    )}
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/customers/${order.customers.id}`}>
                      View Customer
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Payment Status Update - Collapsible */}
            <CollapsibleSection
              title="Payment Details"
              icon={<CreditCard className="h-5 w-5" />}
              defaultOpen={false}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm">Payment Status</span>
                  <span
                    className={`font-semibold text-sm ${
                      paymentConfig[order.payment_status]?.color || 'text-gray-600'
                    }`}
                  >
                    {paymentConfig[order.payment_status]?.label || order.payment_status}
                  </span>
                </div>

                {order.payment_method && (
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-sm">Payment Method</span>
                    <span className="text-muted-foreground text-sm">
                      {order.payment_method.toUpperCase()}
                    </span>
                  </div>
                )}

                <Separator />
                
                <PaymentStatusUpdate
                  orderId={order.id}
                  currentPaymentStatus={order.payment_status}
                  currentPaymentMethod={order.payment_method}
                />
              </div>
            </CollapsibleSection>

            {/* Order Status Update - Collapsible */}
            <CollapsibleSection
              title="Order Status"
              icon={<Package className="h-5 w-5" />}
              defaultOpen={false}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm">Current Status</span>
                  <Badge
                    className={`${statusConfig[order.status]?.color || 'bg-gray-500'} text-white`}
                  >
                    {statusConfig[order.status]?.label || order.status}
                  </Badge>
                </div>

                {order.tracking_number && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-1">Tracking Number</p>
                      <p className="text-sm text-muted-foreground font-mono break-all">
                        {order.tracking_number}
                      </p>
                    </div>
                  </>
                )}

                {order.courier_service && (
                  <div>
                    <p className="text-sm font-medium mb-1">Courier Service</p>
                    <p className="text-sm text-muted-foreground break-words">
                      {order.courier_service}
                    </p>
                  </div>
                )}

                {order.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-1">Notes</p>
                      <p className="text-sm text-muted-foreground break-words">
                        {order.notes}
                      </p>
                    </div>
                  </>
                )}

                <Separator />
                
                <OrderStatusUpdate 
                  orderId={order.id} 
                  currentStatus={order.status}
                  orderNumber={order.order_number}
                  customerName={order.customers?.name}
                  customerPhone={order.customers?.phone}
                  orderItems={order.order_items?.map((item: any) => item.product_name) || []}
                  totalAmount={parseFloat(order.total_amount)}
                />
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </div>
  )
}