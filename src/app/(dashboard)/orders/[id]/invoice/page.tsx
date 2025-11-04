export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

// FIXED: params is now a Promise
export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // AWAIT params before using it
  const { id } = await params

  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers (*),
      order_items (*)
    `)
    .eq('id', id)
    .single()

  if (error || !order) {
    console.error('Invoice fetch error:', error)
    return notFound()
  }

  return (
    <div className="bg-muted/30 p-8 print:p-0">
      <Card className="max-w-3xl mx-auto p-8 print:shadow-none print:border-none print:p-0">
        <CardContent>
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold">ResellerPro</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Your Business Address Here
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-muted-foreground">
                INVOICE
              </h2>
              <p className="text-muted-foreground">#{order.order_number}</p>
              <p className="text-muted-foreground">
                Date: {new Date(order.created_at).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          {/* Bill To */}
          {order.customers && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                BILL TO
              </h3>
              <p className="font-semibold">{order.customers.name}</p>
              {order.customers.address_line1 && (
                <>
                  <p>{order.customers.address_line1}</p>
                  {order.customers.address_line2 && (
                    <p>{order.customers.address_line2}</p>
                  )}
                  <p>
                    {order.customers.city}, {order.customers.state} -{' '}
                    {order.customers.pincode}
                  </p>
                </>
              )}
              <p>{order.customers.phone}</p>
            </div>
          )}

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr className="border-b">
                  <th className="p-3 text-left font-medium">Item</th>
                  <th className="p-3 text-center font-medium">Quantity</th>
                  <th className="p-3 text-right font-medium">Unit Price</th>
                  <th className="p-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items?.map((item: any) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-3">{item.product_name}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">
                      ₹{parseFloat(item.unit_selling_price).toFixed(2)}
                    </td>
                    <td className="p-3 text-right">
                      ₹{parseFloat(item.subtotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mt-8">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{parseFloat(order.shipping_cost || 0).toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Discount</span>
                  <span>-₹{parseFloat(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t my-2"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid</span>
                <span>
                  ₹
                  {order.payment_status === 'paid'
                    ? parseFloat(order.total_amount).toFixed(2)
                    : '0.00'}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Amount Due</span>
                <span>
                  ₹
                  {order.payment_status === 'paid'
                    ? '0.00'
                    : parseFloat(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
            <p>
              If you have any questions, please contact us at
              support@resellerpro.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}