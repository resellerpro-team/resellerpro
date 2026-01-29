export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { InvoiceActions } from '@/components/orders/InvoiceActions'
import { InvoiceLayout } from '@/components/orders/InvoiceLayout'

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
    redirect('/signin')
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
  const displayName = profile?.business_name || profile?.full_name || 'Your Business'
  const businessEmail = profile?.business_email || profile?.email || user.email

  // ✅ 5️⃣ Return Invoice
  return (
    <div className="bg-muted/30 p-4 sm:p-8 print:p-0 min-h-screen">
      {/* Print-only CSS to force full-width and remove backgrounds */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body { background: white !important; }
          .bg-muted\\/30 { background: white !important; padding: 0 !important; }
          .max-w-3xl { max-width: 100% !important; margin: 0 !important; width: 100% !important; }
          .shadow-md { shadow: none !important; }
          @page { margin: 1cm; }
        }
      `}} />

      <div className="max-w-3xl mx-auto">
        <div className="print:hidden">
          <InvoiceActions
            orderNumber={order.order_number}
            contentId="invoice-content"
          />
        </div>

        <InvoiceLayout
          order={order}
          profile={profile}
          businessEmail={businessEmail}
          displayName={displayName}
        />
      </div>
    </div>
  )
}