import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { OrderSuccessClient } from './OrderSuccessClient'
import type { ShopTheme } from '@/types'

interface Props {
  params: { shopSlug: string; orderId: string }
}

export default async function OrderSuccessPage({ params }: Props) {
  const { shopSlug, orderId } = params
  const supabase = await createAdminClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('shop_slug', shopSlug)
    .single()

  if (!profile) return notFound()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .eq('user_id', profile.id)
    .single()

  if (!order) return notFound()

  const theme = profile.shop_theme as ShopTheme | null

  return (
    <OrderSuccessClient
      order={order}
      profile={profile}
      theme={theme}
      shopSlug={shopSlug}
    />
  )
}
