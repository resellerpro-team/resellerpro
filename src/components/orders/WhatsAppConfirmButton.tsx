'use client'

import { useState } from 'react'
import { MessageCircle, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { generateOrderConfirmationMessage, generateWhatsAppLink } from '@/lib/whatsapp'
import type { Order, Profile } from '@/types'

interface WhatsAppConfirmButtonProps {
  order: Order
  profile: Profile
  onConfirmed?: () => void
}

export function WhatsAppConfirmButton({ order, profile, onConfirmed }: WhatsAppConfirmButtonProps) {
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(
    order.status !== 'pending' || order.whatsapp_sent
  )
  const supabase = createClient()

  async function handleConfirm() {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          whatsapp_sent: true,
        })
        .eq('id', order.id)

      if (error) throw error

      const message = generateOrderConfirmationMessage(order, profile)
      const phone = order.customer_phone || order.shipping_phone || ''
      const link = generateWhatsAppLink(phone, message)

      window.open(link, '_blank')
      setConfirmed(true)
      onConfirmed?.()
    } catch (err) {
      console.error('Confirm order error:', err)
      alert('Failed to confirm order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-green-700 bg-green-100 border border-green-200 cursor-not-allowed"
      >
        <Check className="w-3.5 h-3.5" />
        Confirmed
      </button>
    )
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-colors active:scale-95 disabled:opacity-70"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <MessageCircle className="w-3.5 h-3.5" />
      )}
      {loading ? 'Opening...' : 'Confirm + WhatsApp'}
    </button>
  )
}
