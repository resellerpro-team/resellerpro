export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // ✅ 1️⃣ Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // ✅ 2️⃣ Fetch user's business profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching business profile:', profileError)
  }

  // ✅ 3️⃣ Fetch order + customer + items
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

  // ✅ 4️⃣ Prepare business info
  const businessName = profile?.business_name || 'Your Business Name'
  const businessEmail = profile?.business_email || 'support@resellerpro.com'

  // ✅ 5️⃣ Return Invoice
  return (
    <div className="bg-muted/30 p-4 sm:p-8 print:p-0">
      <Card className="max-w-3xl mx-auto p-4 sm:p-8 rounded-2xl shadow-md print:shadow-none print:border-none print:p-0">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
            {/* Left side - Logo + Names */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight">
                    ResellerPro
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium">
                    {businessName}
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Invoice Info */}
            <div className="text-left sm:text-right w-full sm:w-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-muted-foreground">
                INVOICE
              </h2>
              <p className="text-sm text-muted-foreground">
                #{order.order_number}
              </p>
              <p className="text-sm text-muted-foreground">
                Date: {new Date(order.created_at).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          {/* Bill To */}
          {order.customers && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">
                BILL TO
              </h3>
              <p className="font-semibold text-sm sm:text-base">
                {order.customers.name}
              </p>
              {order.customers.address_line1 && (
                <>
                  <p className="text-sm">{order.customers.address_line1}</p>
                  {order.customers.address_line2 && (
                    <p className="text-sm">{order.customers.address_line2}</p>
                  )}
                  <p className="text-sm">
                    {order.customers.city}, {order.customers.state} -{' '}
                    {order.customers.pincode}
                  </p>
                </>
              )}
              <p className="text-sm">{order.customers.phone}</p>
            </div>
          )}

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm border-collapse">
              <thead className="bg-muted">
                <tr className="border-b">
                  <th className="p-3 text-left font-medium">Item</th>
                  <th className="p-3 text-center font-medium">Qty</th>
                  <th className="p-3 text-right font-medium">Unit</th>
                  <th className="p-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items?.map((item: any) => (
                  <tr key={item.id} className="border-b hover:bg-muted/40">
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
          <div className="flex justify-end mt-6 sm:mt-8">
            <div className="w-full sm:max-w-xs space-y-2 text-sm sm:text-base">
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
          <div className="mt-10 sm:mt-16 text-center text-xs sm:text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
            <p>
              For any questions, contact us at{' '}
              <span className="font-medium">{businessEmail}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
