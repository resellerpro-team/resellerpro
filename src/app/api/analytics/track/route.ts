import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    await supabase.from('store_analytics').insert({
      user_id: body.userId,
      session_id: body.sessionId ?? `srv-${Date.now()}`,
      event_type: body.eventType,
      product_id: body.productId ?? null,
      order_id: body.orderId ?? null,
      referrer: body.referrer ?? 'direct',
      device_type: body.deviceType ?? 'mobile',
      metadata: body.metadata ?? {},
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Analytics track error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
