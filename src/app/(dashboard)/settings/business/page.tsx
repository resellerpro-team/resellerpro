export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import BusinessForm from '@/components/settings/BusinessForm'

export const metadata = {
  title: 'Business Settings - ResellerPro',
}

export default async function BusinessPage() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  // Fetch user profile with business data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Prepare business data
  const businessData = {
    id: user.id,
    business_name: profile?.business_name || '',
    gstin: profile?.gstin || '',
    business_address: profile?.business_address || '',
    business_phone: profile?.business_phone || profile?.phone || '',
    business_email: profile?.business_email || user.email || '',
    business_website: profile?.business_website || '',
    pan_number: profile?.pan_number || '',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>
          Update your business details. This information will appear on invoices and receipts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BusinessForm business={businessData} />
      </CardContent>
    </Card>
  )
}