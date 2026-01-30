
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { NewOrderForm } from '@/components/orders/NewOrderForm'
import { redirect } from 'next/navigation'
import { RequireVerification } from '@/components/shared/RequireVerification'


export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>
}) {
  const params = await searchParams
  const preSelectedCustomerId = params.customerId

  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  // Fetch customers for selection
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, phone')
    .eq('user_id', user.id)
    .order('name')

  // Fetch ALL products (not just in_stock) - exclude only out_of_stock
  const { data: products } = await supabase
    .from('products')
    .select('id, name, selling_price, cost_price, stock_status, stock_quantity')
    .eq('user_id', user.id)
    .neq('stock_status', 'out_of_stock') // Only exclude out of stock
    .order('name')


  return (
    <RequireVerification autoOpen={true}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/orders">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <CardTitle className="text-2xl">Create New Order</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a customer and add products to create an order
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <NewOrderForm
          customers={customers || []}
          products={products || []}
          preSelectedCustomerId={preSelectedCustomerId}
        />
      </div>
    </RequireVerification>
  )
}