export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { NewOrderForm } from '@/components/orders/NewOrderForm'

export default async function NewOrderPage() {
  const supabase = await createClient()

  // Fetch customers for selection
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, phone')
    .order('name')

  // Fetch products for selection
  const { data: products } = await supabase
    .from('products')
    .select('id, name, selling_price, cost_price, stock_status')
    .eq('stock_status', 'in_stock')
    .order('name')

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Create New Order
          </h1>
          <p className="text-muted-foreground">
            Select a customer and add products to create an order
          </p>
        </div>
      </div>

      <NewOrderForm customers={customers || []} products={products || []} />
    </div>
  )
}