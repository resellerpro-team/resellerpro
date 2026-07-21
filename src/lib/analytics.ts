import { createClient } from '@/lib/supabase/client'
import type { AnalyticsEventType } from '@/types'

// ─── Session ──────────────────────────────────────────────────────────────────

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  try {
    let id = sessionStorage.getItem('rp_sid')
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      sessionStorage.setItem('rp_sid', id)
    }
    return id
  } catch {
    return 'unknown'
  }
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'mobile'
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

function getReferrer(): string {
  if (typeof window === 'undefined') return 'direct'
  try {
    const utm = new URLSearchParams(window.location.search).get('utm_source')
    if (utm) return utm.toLowerCase().slice(0, 50)
    const ref = document.referrer.toLowerCase()
    if (ref.includes('instagram')) return 'instagram'
    if (ref.includes('facebook') || ref.includes('fb.com')) return 'facebook'
    if (ref.includes('whatsapp')) return 'whatsapp'
    if (ref) return 'other'
    return 'direct'
  } catch {
    return 'direct'
  }
}

// ─── Track Event ──────────────────────────────────────────────────────────────

interface TrackEventParams {
  userId: string
  eventType: AnalyticsEventType
  productId?: string
  orderId?: string
  metadata?: Record<string, unknown>
}

export async function trackEvent(params: TrackEventParams): Promise<void> {
  // Fire and forget — never block the UI
  try {
    const supabase = createClient()
    await supabase.from('store_analytics').insert({
      user_id: params.userId,
      session_id: getSessionId(),
      event_type: params.eventType,
      product_id: params.productId ?? null,
      order_id: params.orderId ?? null,
      referrer: getReferrer(),
      device_type: getDeviceType(),
      metadata: params.metadata ?? {},
    })
  } catch {
    // Silently fail — analytics must never crash the app
  }
}

// ─── Server-side track (via API route) ───────────────────────────────────────

export async function trackServerEvent(params: TrackEventParams & {
  sessionId?: string
  referrer?: string
  deviceType?: string
}): Promise<void> {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: params.userId,
        sessionId: params.sessionId ?? getSessionId(),
        eventType: params.eventType,
        productId: params.productId ?? null,
        orderId: params.orderId ?? null,
        referrer: params.referrer ?? getReferrer(),
        deviceType: params.deviceType ?? getDeviceType(),
        metadata: params.metadata ?? {},
      }),
    })
  } catch {
    // Silently fail
  }
}
